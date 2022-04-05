## Release schedule

We are currently in a very active development phase and open beta. This means that we push new features to production after only rudimentary testing, and accept that some bugs might be found in production. In a later phase of development we will become more conservative and test our releases more thoroughly before going live. One step towards this, now that we are preparing for a "soft launch", is adopting structured release cycles. These cycles will be short while we are still in open beta.

We should aim to push a new version of Cobudget to production on Thursday afternoon every other week.
Every other Monday afternoon, three days before a new version goes live, the 'staging' branch is frozen for new updates, except for bug-fixes that are found while testing the release candidate. Sometimes fixing bugs takes longer than three days, and then we postpone pushing the new release candidate live.

We adopt this schedule to fit with that many in our team have a co-working day scheduled on Tuesdays, so that is when testing could be done most efficiently. Pushing to production on Thursday afternoons gives us two days to fix bugs that are found during Tuesday testing, and we have Friday before the weekend to find and fix any bugs that might have been introduced as other bugs were fixed.

## Branches

We use three branches for our release cycle.

**main** is our active development branch. Everyone works from the assumption that they should keep their own WIP branches in sync with 'main'.

**staging** is our release candidate branch. It gets automatically deployed to staging.cobudget.com.

**production** is our production branch. It gets automatically deployed to cobudget.com.

## Merging

Almost all updates should be made from feature branches to 'main', and then merged immediately to 'staging' for testing.
While the 'staging' branch is frozen before a new release, new code is only pushed to 'main', except when the code fixes bugs or mistakes that are introduced with the new release. While this is happening, all updates to 'staging' should then be immediately merged to 'main'.

In some cases, if two people are working on large WIP features that touch the same code, they may want to also keep their respective branches in sync with each other.

After a new release is pushed to production, all new changes in 'main' are immediately merged to 'staging'.

Small bug fixes and minor fixes can be pushed straight to 'production', but they must then also be immediately merged to 'main', and then to 'staging' - or to 'staging' and then to 'main' if the staging branch is currently frozen.

In summary, this is the order of merging:

**If 'staging' is not frozen**

feature-branch -> main -> staging

**If 'staging' is frozen**

feature-branch -> main

**If update is a small hotfix**

feature-branch -> production -> staging -> main

**When a new version is released**

staging -> production

**After a new version is released**

main -> staging

## Responsibilities

Product owner (currently @aerugo) is responsible for:

- Making changes to the protocol
- Deciding if a release candidate is stable enough to push to production
- Notifying developers about when the stable branch is frozen
- Deciding if we need longer or shorter release cycles

Developers are responsible for:

- Keeping their dev branches in sync
- Merging their updates according to the protocol (so, in the case of merging hotfixes, they would need to do 4 merges)
