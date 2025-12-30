/**
 * Migration Script: Cleanup Non-Borderland Data
 *
 * This script connects to the Cobudget database and removes all data
 * that is NOT associated with the 'borderland' organization.
 *
 * Usage:
 *   # First, ensure you have the DATABASE_URL environment variable set
 *   # or create a .env file in the ui directory
 *
 *   # Dry run (default) - see what would be deleted without making changes:
 *   cd ui && npx tsx scripts/cleanup-non-borderland-data.ts
 *
 *   # Live run - actually delete the data:
 *   cd ui && DRY_RUN=false npx tsx scripts/cleanup-non-borderland-data.ts
 *
 *   # Use a different organization:
 *   cd ui && TARGET_ORG_SLUG=myorg DRY_RUN=false npx tsx scripts/cleanup-non-borderland-data.ts
 *
 * IMPORTANT: Make sure to backup your database before running this script!
 *
 * Environment variables:
 *   DATABASE_URL    - PostgreSQL connection string (required)
 *   DRY_RUN         - Set to 'false' to perform actual deletions (default: 'true')
 *   TARGET_ORG_SLUG - Organization slug to keep (default: 'borderland')
 */

import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

/**
 * Parse DATABASE_URL to extract database name and host for display
 */
function parseDatabaseUrl(): { host: string; database: string; fullInfo: string } {
  const url = process.env.DATABASE_URL || '';
  try {
    // Handle both postgres:// and postgresql:// schemes
    const parsed = new URL(url.replace(/^postgres:/, 'postgresql:'));
    const host = parsed.hostname;
    const database = parsed.pathname.replace(/^\//, '').split('?')[0];
    const port = parsed.port || '5432';
    return {
      host,
      database,
      fullInfo: `${host}:${port}/${database}`,
    };
  } catch {
    return {
      host: 'unknown',
      database: 'unknown',
      fullInfo: 'Could not parse DATABASE_URL',
    };
  }
}

/**
 * Prompt user for confirmation by typing the database name
 */
async function confirmDatabaseAction(dbInfo: { host: string; database: string; fullInfo: string }, orgName: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log('\n' + '⚠️'.repeat(30));
    console.log('\n🚨 DESTRUCTIVE ACTION WARNING 🚨\n');
    console.log(`Database: ${dbInfo.fullInfo}`);
    console.log(`Organization to KEEP: ${orgName}`);
    console.log(`\nALL OTHER DATA WILL BE PERMANENTLY DELETED!\n`);
    console.log('⚠️'.repeat(30) + '\n');

    rl.question(`To confirm, type the database name "${dbInfo.database}": `, (answer) => {
      rl.close();
      if (answer.trim() === dbInfo.database) {
        console.log('\n✅ Confirmation accepted. Proceeding with deletion...\n');
        resolve(true);
      } else {
        console.log('\n❌ Confirmation failed. Aborting.\n');
        resolve(false);
      }
    });
  });
}

// Set to false to actually perform deletions
const DRY_RUN = process.env.DRY_RUN !== 'false';
const TARGET_ORG_SLUG = process.env.TARGET_ORG_SLUG || 'borderland';

// PostgreSQL has a limit of 32767 bind variables per query
// Use a smaller batch size to be safe
const BATCH_SIZE = 10000;

interface CleanupStats {
  [key: string]: number;
}

/**
 * Simple progress bar utility for console output
 */
class ProgressBar {
  private total: number;
  private current: number;
  private barLength: number;
  private label: string;
  private startTime: number;

  constructor(label: string, total: number, barLength: number = 40) {
    this.label = label;
    this.total = total;
    this.current = 0;
    this.barLength = barLength;
    this.startTime = Date.now();
  }

  update(current: number): void {
    this.current = current;
    this.render();
  }

  increment(amount: number = 1): void {
    this.current += amount;
    this.render();
  }

  private render(): void {
    const percent = this.total > 0 ? this.current / this.total : 0;
    const filledLength = Math.round(this.barLength * percent);
    const emptyLength = this.barLength - filledLength;

    const filledBar = '█'.repeat(filledLength);
    const emptyBar = '░'.repeat(emptyLength);

    const percentStr = (percent * 100).toFixed(1).padStart(5);
    const currentStr = this.current.toString().padStart(this.total.toString().length);

    // Calculate elapsed time and ETA
    const elapsed = (Date.now() - this.startTime) / 1000;
    const rate = this.current / elapsed;
    const remaining = this.total - this.current;
    const eta = rate > 0 ? remaining / rate : 0;

    const etaStr = eta > 0 ? ` ETA: ${formatTime(eta)}` : '';

    process.stdout.write(`\r  ${this.label}: [${filledBar}${emptyBar}] ${percentStr}% (${currentStr}/${this.total})${etaStr}   `);
  }

  complete(): void {
    this.current = this.total;
    this.render();
    const elapsed = (Date.now() - this.startTime) / 1000;
    process.stdout.write(` Done in ${formatTime(elapsed)}\n`);
  }
}

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(0)}s`;
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  }
}

/**
 * Helper function to delete records in batches to avoid PostgreSQL bind variable limits
 */
async function deleteInBatches<T>(
  ids: string[],
  deleteFunc: (batchIds: string[]) => Promise<T>,
  label: string
): Promise<void> {
  if (ids.length === 0) return;

  const totalBatches = Math.ceil(ids.length / BATCH_SIZE);
  const progress = new ProgressBar(label, totalBatches);

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    await deleteFunc(batch);
    progress.increment();
  }

  progress.complete();
}

async function main() {
  const dbInfo = parseDatabaseUrl();

  console.log('='.repeat(60));
  console.log('Cobudget Database Cleanup Script');
  console.log('='.repeat(60));
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE (data will be deleted!)'}`);
  console.log(`Database: ${dbInfo.fullInfo}`);
  console.log(`Target Organization: ${TARGET_ORG_SLUG}`);
  console.log('='.repeat(60));

  const stats: CleanupStats = {};

  try {
    // Step 1: Find the target organization
    console.log('\n[1/3] Finding target organization...');
    const targetGroup = await prisma.group.findUnique({
      where: { slug: TARGET_ORG_SLUG },
      include: {
        rounds: { select: { id: true } },
        groupMembers: { select: { userId: true } },
      },
    });

    if (!targetGroup) {
      throw new Error(`Organization with slug '${TARGET_ORG_SLUG}' not found!`);
    }

    console.log(`Found organization: ${targetGroup.name} (ID: ${targetGroup.id})`);
    console.log(`  - Rounds: ${targetGroup.rounds.length}`);
    console.log(`  - Group Members: ${targetGroup.groupMembers.length}`);

    // Require confirmation for LIVE runs
    if (!DRY_RUN) {
      const confirmed = await confirmDatabaseAction(dbInfo, targetGroup.name);
      if (!confirmed) {
        await prisma.$disconnect();
        process.exit(1);
      }
    }

    // Step 2: Collect IDs to keep
    console.log('\n[2/3] Collecting data to preserve...');

    const targetGroupId = targetGroup.id;
    const targetRoundIds = targetGroup.rounds.map(r => r.id);

    // Get all users associated with borderland through any means
    const groupMemberUserIds = targetGroup.groupMembers.map(gm => gm.userId);

    // Get users who are round members of borderland rounds
    const roundMemberUsers = await prisma.roundMember.findMany({
      where: { roundId: { in: targetRoundIds } },
      select: { userId: true },
    });
    const roundMemberUserIds = roundMemberUsers.map(rm => rm.userId);

    // Combine all user IDs to keep (unique)
    const usersToKeep = [...new Set([...groupMemberUserIds, ...roundMemberUserIds])];

    console.log(`Users to preserve: ${usersToKeep.length}`);
    console.log(`Rounds to preserve: ${targetRoundIds.length}`);

    // Step 3: Delete data not associated with the target organization
    console.log('\n[3/3] Cleaning up data...');

    // Get IDs of rounds to delete
    const roundsToDelete = await prisma.round.findMany({
      where: { groupId: { not: targetGroupId } },
      select: { id: true },
    });
    const roundIdsToDelete = roundsToDelete.map(r => r.id);

    // Get IDs of groups to delete
    const groupsToDelete = await prisma.group.findMany({
      where: { id: { not: targetGroupId } },
      select: { id: true },
    });
    const groupIdsToDelete = groupsToDelete.map(g => g.id);

    // Get RoundMember IDs to delete (members of rounds being deleted)
    const roundMembersToDelete = await prisma.roundMember.findMany({
      where: { roundId: { in: roundIdsToDelete } },
      select: { id: true },
    });
    const roundMemberIdsToDelete = roundMembersToDelete.map(rm => rm.id);

    // Get Bucket IDs to delete
    const bucketsToDelete = await prisma.bucket.findMany({
      where: { roundId: { in: roundIdsToDelete } },
      select: { id: true },
    });
    const bucketIdsToDelete = bucketsToDelete.map(b => b.id);

    // Get Account IDs to delete (accounts associated with deleted round members and buckets)
    const accountsFromRoundMembers = await prisma.roundMember.findMany({
      where: { roundId: { in: roundIdsToDelete } },
      select: {
        incomingAccountId: true,
        outgoingAccountId: true,
        statusAccountId: true
      },
    });

    const accountsFromBuckets = await prisma.bucket.findMany({
      where: { roundId: { in: roundIdsToDelete } },
      select: {
        statusAccountId: true,
        outgoingAccountId: true
      },
    });

    const accountsFromRounds = await prisma.round.findMany({
      where: { id: { in: roundIdsToDelete } },
      select: { statusAccountId: true },
    });

    const accountIdsToDelete = [
      ...accountsFromRoundMembers.flatMap(rm => [rm.incomingAccountId, rm.outgoingAccountId, rm.statusAccountId]),
      ...accountsFromBuckets.flatMap(b => [b.statusAccountId, b.outgoingAccountId]),
      ...accountsFromRounds.map(r => r.statusAccountId),
    ].filter((id): id is string => id !== null);

    console.log('\nData to be deleted:');
    console.log(`  - Groups: ${groupIdsToDelete.length}`);
    console.log(`  - Rounds: ${roundIdsToDelete.length}`);
    console.log(`  - Round Members: ${roundMemberIdsToDelete.length}`);
    console.log(`  - Buckets: ${bucketIdsToDelete.length}`);
    console.log(`  - Accounts: ${accountIdsToDelete.length}`);

    if (DRY_RUN) {
      console.log('\n--- DRY RUN: Simulating deletions ---\n');
    } else {
      console.log('\n--- LIVE RUN: Performing deletions ---\n');
    }

    // Delete in order of dependencies (leaf tables first)

    // 1. Transactions (depends on Account, Round, User, RoundMember)
    const transactionCount = await prisma.transaction.count({
      where: { roundId: { in: roundIdsToDelete } },
    });
    stats['Transaction'] = transactionCount;
    console.log(`Deleting ${transactionCount} transactions...`);
    if (!DRY_RUN) {
      await prisma.transaction.deleteMany({
        where: { roundId: { in: roundIdsToDelete } },
      });
    }

    // 2. Contributions (depends on Round, RoundMember, Bucket)
    const contributionCount = await prisma.contribution.count({
      where: { roundId: { in: roundIdsToDelete } },
    });
    stats['Contribution'] = contributionCount;
    console.log(`Deleting ${contributionCount} contributions...`);
    if (!DRY_RUN) {
      await prisma.contribution.deleteMany({
        where: { roundId: { in: roundIdsToDelete } },
      });
    }

    // 3. Allocations (depends on Round, RoundMember)
    const allocationCount = await prisma.allocation.count({
      where: { roundId: { in: roundIdsToDelete } },
    });
    stats['Allocation'] = allocationCount;
    console.log(`Deleting ${allocationCount} allocations...`);
    if (!DRY_RUN) {
      await prisma.allocation.deleteMany({
        where: { roundId: { in: roundIdsToDelete } },
      });
    }

    // 4. FavoriteBuckets (depends on RoundMember)
    const favoriteBucketCount = await prisma.favoriteBucket.count({
      where: { roundMemberId: { in: roundMemberIdsToDelete } },
    });
    stats['FavoriteBucket'] = favoriteBucketCount;
    console.log(`Deleting ${favoriteBucketCount} favorite buckets...`);
    if (!DRY_RUN) {
      await prisma.favoriteBucket.deleteMany({
        where: { roundMemberId: { in: roundMemberIdsToDelete } },
      });
    }

    // 5. Comments (depends on RoundMember, Bucket)
    const commentCount = await prisma.comment.count({
      where: { bucketId: { in: bucketIdsToDelete } },
    });
    stats['Comment'] = commentCount;
    console.log(`Deleting ${commentCount} comments...`);
    if (!DRY_RUN) {
      await prisma.comment.deleteMany({
        where: { bucketId: { in: bucketIdsToDelete } },
      });
    }

    // 6. Flags (depends on RoundMember, Bucket, Guideline) - handle self-reference first
    // First, remove self-references
    const flagsWithResolvingFlag = await prisma.flag.count({
      where: {
        bucketId: { in: bucketIdsToDelete },
        resolvingFlagId: { not: null },
      },
    });
    if (!DRY_RUN && flagsWithResolvingFlag > 0) {
      await prisma.flag.updateMany({
        where: { bucketId: { in: bucketIdsToDelete } },
        data: { resolvingFlagId: null },
      });
    }

    const flagCount = await prisma.flag.count({
      where: { bucketId: { in: bucketIdsToDelete } },
    });
    stats['Flag'] = flagCount;
    console.log(`Deleting ${flagCount} flags...`);
    if (!DRY_RUN) {
      await prisma.flag.deleteMany({
        where: { bucketId: { in: bucketIdsToDelete } },
      });
    }

    // 7. ExpenseReceipts (depends on Expense)
    const expenseIdsToDelete = await prisma.expense.findMany({
      where: { bucketId: { in: bucketIdsToDelete } },
      select: { id: true },
    });
    const expenseReceiptCount = await prisma.expenseReceipt.count({
      where: { expenseId: { in: expenseIdsToDelete.map(e => e.id) } },
    });
    stats['ExpenseReceipt'] = expenseReceiptCount;
    console.log(`Deleting ${expenseReceiptCount} expense receipts...`);
    if (!DRY_RUN) {
      await prisma.expenseReceipt.deleteMany({
        where: { expenseId: { in: expenseIdsToDelete.map(e => e.id) } },
      });
    }

    // 8. Expenses (depends on Bucket)
    const expenseCount = await prisma.expense.count({
      where: { bucketId: { in: bucketIdsToDelete } },
    });
    stats['Expense'] = expenseCount;
    console.log(`Deleting ${expenseCount} expenses...`);
    if (!DRY_RUN) {
      await prisma.expense.deleteMany({
        where: { bucketId: { in: bucketIdsToDelete } },
      });
    }

    // 9. FieldValues (depends on Field, Bucket)
    const fieldValueCount = await prisma.fieldValue.count({
      where: { bucketId: { in: bucketIdsToDelete } },
    });
    stats['FieldValue'] = fieldValueCount;
    console.log(`Deleting ${fieldValueCount} field values...`);
    if (!DRY_RUN) {
      await prisma.fieldValue.deleteMany({
        where: { bucketId: { in: bucketIdsToDelete } },
      });
    }

    // 10. BudgetItems (depends on Bucket)
    const budgetItemCount = await prisma.budgetItem.count({
      where: { bucketId: { in: bucketIdsToDelete } },
    });
    stats['BudgetItem'] = budgetItemCount;
    console.log(`Deleting ${budgetItemCount} budget items...`);
    if (!DRY_RUN) {
      await prisma.budgetItem.deleteMany({
        where: { bucketId: { in: bucketIdsToDelete } },
      });
    }

    // 11. Images (depends on Bucket)
    const imageCount = await prisma.image.count({
      where: { bucketId: { in: bucketIdsToDelete } },
    });
    stats['Image'] = imageCount;
    console.log(`Deleting ${imageCount} images...`);
    if (!DRY_RUN) {
      await prisma.image.deleteMany({
        where: { bucketId: { in: bucketIdsToDelete } },
      });
    }

    // 12. Clear bucket-tag relations and delete buckets
    // First, disconnect tags from buckets
    console.log(`Disconnecting tags from ${bucketIdsToDelete.length} buckets...`);
    if (!DRY_RUN) {
      const bucketProgress = new ProgressBar('Buckets', bucketIdsToDelete.length);
      for (const bucketId of bucketIdsToDelete) {
        await prisma.bucket.update({
          where: { id: bucketId },
          data: { tags: { set: [] }, cocreators: { set: [] } },
        });
        bucketProgress.increment();
      }
      bucketProgress.complete();
    }

    // 13. Clear account references from buckets before deleting buckets
    console.log('Clearing account references from buckets...');
    if (!DRY_RUN) {
      await prisma.bucket.updateMany({
        where: { roundId: { in: roundIdsToDelete } },
        data: { statusAccountId: null, outgoingAccountId: null },
      });
    }

    // 14. Buckets (depends on Round)
    stats['Bucket'] = bucketIdsToDelete.length;
    console.log(`Deleting ${bucketIdsToDelete.length} buckets...`);
    if (!DRY_RUN) {
      await prisma.bucket.deleteMany({
        where: { roundId: { in: roundIdsToDelete } },
      });
    }

    // 15. Guidelines (depends on Round) - flags already deleted
    const guidelineCount = await prisma.guideline.count({
      where: { roundId: { in: roundIdsToDelete } },
    });
    stats['Guideline'] = guidelineCount;
    console.log(`Deleting ${guidelineCount} guidelines...`);
    if (!DRY_RUN) {
      await prisma.guideline.deleteMany({
        where: { roundId: { in: roundIdsToDelete } },
      });
    }

    // 16. Tags (depends on Round) - bucket relations already cleared
    const tagCount = await prisma.tag.count({
      where: { roundId: { in: roundIdsToDelete } },
    });
    stats['Tag'] = tagCount;
    console.log(`Deleting ${tagCount} tags...`);
    if (!DRY_RUN) {
      await prisma.tag.deleteMany({
        where: { roundId: { in: roundIdsToDelete } },
      });
    }

    // 17. Fields (depends on Round) - field values already deleted
    const fieldCount = await prisma.field.count({
      where: { roundId: { in: roundIdsToDelete } },
    });
    stats['Field'] = fieldCount;
    console.log(`Deleting ${fieldCount} fields...`);
    if (!DRY_RUN) {
      await prisma.field.deleteMany({
        where: { roundId: { in: roundIdsToDelete } },
      });
    }

    // 18. Clear account references from RoundMembers
    console.log('Clearing account references from round members...');
    if (!DRY_RUN) {
      await prisma.roundMember.updateMany({
        where: { roundId: { in: roundIdsToDelete } },
        data: {
          incomingAccountId: null,
          outgoingAccountId: null,
          statusAccountId: null
        },
      });
    }

    // 19. RoundMembers (depends on Round, User)
    stats['RoundMember'] = roundMemberIdsToDelete.length;
    console.log(`Deleting ${roundMemberIdsToDelete.length} round members...`);
    if (!DRY_RUN) {
      await prisma.roundMember.deleteMany({
        where: { roundId: { in: roundIdsToDelete } },
      });
    }

    // 20. Clear account references from Rounds
    console.log('Clearing account references from rounds...');
    if (!DRY_RUN) {
      await prisma.round.updateMany({
        where: { id: { in: roundIdsToDelete } },
        data: { statusAccountId: null },
      });
    }

    // 21. Rounds (depends on Group, Account)
    stats['Round'] = roundIdsToDelete.length;
    console.log(`Deleting ${roundIdsToDelete.length} rounds...`);
    if (!DRY_RUN) {
      await prisma.round.deleteMany({
        where: { id: { in: roundIdsToDelete } },
      });
    }

    // 22. Delete any remaining transactions that reference accounts being deleted
    // (These are cross-round transactions from preserved rounds to deleted accounts)
    // Must batch this because OR with two IN clauses doubles the bind variables
    console.log('Checking for orphaned transactions (cross-round)...');
    let orphanedTransactionCount = 0;
    const accountBatchSize = Math.floor(BATCH_SIZE / 2); // Half size since OR doubles bindings

    if (!DRY_RUN) {
      const progress = new ProgressBar('Orphaned txns', Math.ceil(accountIdsToDelete.length / accountBatchSize));
      for (let i = 0; i < accountIdsToDelete.length; i += accountBatchSize) {
        const batch = accountIdsToDelete.slice(i, i + accountBatchSize);
        const result = await prisma.transaction.deleteMany({
          where: {
            OR: [
              { fromAccountId: { in: batch } },
              { toAccountId: { in: batch } },
            ],
          },
        });
        orphanedTransactionCount += result.count;
        progress.increment();
      }
      progress.complete();
    } else {
      // Dry run: count in batches
      for (let i = 0; i < accountIdsToDelete.length; i += accountBatchSize) {
        const batch = accountIdsToDelete.slice(i, i + accountBatchSize);
        orphanedTransactionCount += await prisma.transaction.count({
          where: {
            OR: [
              { fromAccountId: { in: batch } },
              { toAccountId: { in: batch } },
            ],
          },
        });
      }
    }

    if (orphanedTransactionCount > 0) {
      console.log(`Deleted ${orphanedTransactionCount} orphaned transactions (cross-round)`);
      stats['OrphanedTransaction'] = orphanedTransactionCount;
    }

    // 23. Accounts (now safe to delete) - use batching due to large numbers
    stats['Account'] = accountIdsToDelete.length;
    console.log(`Deleting ${accountIdsToDelete.length} accounts...`);
    if (!DRY_RUN) {
      await deleteInBatches(
        accountIdsToDelete,
        (batchIds) => prisma.account.deleteMany({ where: { id: { in: batchIds } } }),
        'Accounts'
      );
    }

    // 24. DiscourseConfig (depends on Group)
    const discourseConfigCount = await prisma.discourseConfig.count({
      where: { groupId: { in: groupIdsToDelete } },
    });
    stats['DiscourseConfig'] = discourseConfigCount;
    console.log(`Deleting ${discourseConfigCount} discourse configs...`);
    if (!DRY_RUN) {
      await prisma.discourseConfig.deleteMany({
        where: { groupId: { in: groupIdsToDelete } },
      });
    }

    // 25. GroupMembers (depends on Group, User)
    const groupMemberCount = await prisma.groupMember.count({
      where: { groupId: { in: groupIdsToDelete } },
    });
    stats['GroupMember'] = groupMemberCount;
    console.log(`Deleting ${groupMemberCount} group members...`);
    if (!DRY_RUN) {
      await prisma.groupMember.deleteMany({
        where: { groupId: { in: groupIdsToDelete } },
      });
    }

    // 26. Groups (finally!)
    stats['Group'] = groupIdsToDelete.length;
    console.log(`Deleting ${groupIdsToDelete.length} groups...`);
    if (!DRY_RUN) {
      await prisma.group.deleteMany({
        where: { id: { in: groupIdsToDelete } },
      });
    }

    // 27. Now clean up orphaned users (users not in any remaining group or round)
    console.log('\nFinding orphaned users...');

    // Get all users who have NO group memberships and NO round memberships
    const allUsers = await prisma.user.findMany({
      select: { id: true },
    });

    const usersWithGroupMembership = await prisma.groupMember.findMany({
      select: { userId: true },
      distinct: ['userId'],
    });

    const usersWithRoundMembership = await prisma.roundMember.findMany({
      select: { userId: true },
      distinct: ['userId'],
    });

    const usersWithMembership = new Set([
      ...usersWithGroupMembership.map(gm => gm.userId),
      ...usersWithRoundMembership.map(rm => rm.userId),
    ]);

    const orphanedUserIds = allUsers
      .map(u => u.id)
      .filter(id => !usersWithMembership.has(id));

    console.log(`Found ${orphanedUserIds.length} orphaned users`);

    // 28. Clean up user-related data for orphaned users (use batching for large lists)
    // EmailSettings
    const emailSettingsCount = await prisma.emailSettings.count({
      where: { userId: { in: orphanedUserIds } },
    });
    stats['EmailSettings'] = emailSettingsCount;
    console.log(`Deleting ${emailSettingsCount} email settings...`);
    if (!DRY_RUN) {
      await deleteInBatches(
        orphanedUserIds,
        (batchIds) => prisma.emailSettings.deleteMany({ where: { userId: { in: batchIds } } }),
        'EmailSettings'
      );
    }

    // UserMeta - find orphaned user metas
    const userMetaCount = await prisma.userMeta.count({
      where: { userId: { in: orphanedUserIds } },
    });
    stats['UserMeta'] = userMetaCount;
    console.log(`Deleting ${userMetaCount} user meta records...`);
    if (!DRY_RUN) {
      await deleteInBatches(
        orphanedUserIds,
        (batchIds) => prisma.userMeta.deleteMany({ where: { userId: { in: batchIds } } }),
        'UserMeta'
      );
    }

    // 29. SuperAdminSession - delete sessions for orphaned admins
    const superAdminSessionCount = await prisma.superAdminSession.count({
      where: { adminId: { in: orphanedUserIds } },
    });
    stats['SuperAdminSession'] = superAdminSessionCount;
    console.log(`Deleting ${superAdminSessionCount} super admin sessions...`);
    if (!DRY_RUN) {
      await deleteInBatches(
        orphanedUserIds,
        (batchIds) => prisma.superAdminSession.deleteMany({ where: { adminId: { in: batchIds } } }),
        'SuperAdminSessions'
      );
    }

    // 30. Delete orphaned users
    stats['User'] = orphanedUserIds.length;
    console.log(`Deleting ${orphanedUserIds.length} orphaned users...`);
    if (!DRY_RUN) {
      await deleteInBatches(
        orphanedUserIds,
        (batchIds) => prisma.user.deleteMany({ where: { id: { in: batchIds } } }),
        'Users'
      );
    }

    // 31. Clean up any remaining orphaned data
    // Orphaned expenses (not linked to any bucket)
    const orphanedExpenseCount = await prisma.expense.count({
      where: { bucketId: null },
    });
    if (orphanedExpenseCount > 0) {
      console.log(`Found ${orphanedExpenseCount} orphaned expenses (no bucket)`);
      // Get their IDs first
      const orphanedExpenses = await prisma.expense.findMany({
        where: { bucketId: null },
        select: { id: true },
      });
      // Delete their receipts
      if (!DRY_RUN) {
        await prisma.expenseReceipt.deleteMany({
          where: { expenseId: { in: orphanedExpenses.map(e => e.id) } },
        });
        await prisma.expense.deleteMany({
          where: { bucketId: null },
        });
      }
      stats['OrphanedExpense'] = orphanedExpenseCount;
    }

    // Orphaned images (not linked to any bucket)
    const orphanedImageCount = await prisma.image.count({
      where: { bucketId: null },
    });
    if (orphanedImageCount > 0) {
      console.log(`Found ${orphanedImageCount} orphaned images (no bucket)`);
      if (!DRY_RUN) {
        await prisma.image.deleteMany({
          where: { bucketId: null },
        });
      }
      stats['OrphanedImage'] = orphanedImageCount;
    }

    // Orphaned budget items (not linked to any bucket)
    const orphanedBudgetItemCount = await prisma.budgetItem.count({
      where: { bucketId: null },
    });
    if (orphanedBudgetItemCount > 0) {
      console.log(`Found ${orphanedBudgetItemCount} orphaned budget items (no bucket)`);
      if (!DRY_RUN) {
        await prisma.budgetItem.deleteMany({
          where: { bucketId: null },
        });
      }
      stats['OrphanedBudgetItem'] = orphanedBudgetItemCount;
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
    console.log('\nRecords deleted (or would be deleted):');

    let totalDeleted = 0;
    for (const [table, count] of Object.entries(stats)) {
      if (count > 0) {
        console.log(`  ${table}: ${count}`);
        totalDeleted += count;
      }
    }
    console.log(`\nTotal: ${totalDeleted} records`);

    // Final verification
    if (!DRY_RUN) {
      console.log('\n--- Final Verification ---');
      const remainingGroups = await prisma.group.count();
      const remainingRounds = await prisma.round.count();
      const remainingUsers = await prisma.user.count();
      const remainingBuckets = await prisma.bucket.count();

      console.log(`Remaining groups: ${remainingGroups}`);
      console.log(`Remaining rounds: ${remainingRounds}`);
      console.log(`Remaining users: ${remainingUsers}`);
      console.log(`Remaining buckets: ${remainingBuckets}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log(DRY_RUN
      ? 'DRY RUN COMPLETE - No changes were made'
      : 'CLEANUP COMPLETE - Data has been deleted'
    );
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\nERROR:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
