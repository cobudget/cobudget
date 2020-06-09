- slug, suggest using ID for slug?

- visible word limit on summary

- collaborators needed field, maybe this is a custom question thing?

- easy access to markdown formatting tips

- access to funding guidelines when adding budget

- show which fields in dream form are required

# todo

- make first create dream form:

  - fields:
    - title
  - remove slug and use ID for link

- second page:
  - add summary box
  - add images
  - add description box (on page text area?)
  - add budget box (popup)
  -

---

## miro week 23

- [x] toggle max funding goal
- [x] make budget items add up to funding goal...

# guidelines:

- show guidelines in creating dream form

# bug:

- can give grantlings to one dream multiple times after on another... (and exceed max grants to one dream)

### what needs to be configured in Dreams

- for event in Dreams, one event in Pretix
-

## miro week 21

- [x] unpublish/publish button not visible (when granting is active maybe?)
- [x] show label on unpublished dreams
- [x] see your own unpublished dreams
- [x] fix spacing bug
- [x] show label on dream page as well

- [x] add cocreator bug
- [x] properly load queries (members page)

- [x] add guide role
- [x] fix formatting for large grant numbers
- [x] guides and admins should be able to edit dream
- [x] guides and admins should be able to add/remove co-creators
- [x] info box or about page

### extra

- [x] remove dev notice (anyone can't create event, right?)
- [ ] login inside modal. remember event url?
- [ ] signup flow
- dreams query performance, correct indexes on stuff
- more robust permissions system
  - frontend (canEditDream)
  - backend ()
- [ ] [unapprove, unpublish] could be part of a second order menu.. not prime buttons?
- focus outline... buttons!
- [ ] browse image gallery with keys and buttons
- [ ] fix Dream component, break it out into smaller parts!
- [ ] implement redirect from front page
- [ ] fix buttons in navigation that go together.. too close!

---

## bugs

- if min funding goal is 0, a 0 is displayed instead of funding goals
- pressing enter removes image in edit dream form.
- handle longer list in EditCocreators modal
- broken queries on client side transitions.. see /admin
- Donate to dream button is available for dreams without funding goals
- Remove ugly focus on material ui buttons.

## chores:

- fix index for dreams query to include published field

- implement loading state on all buttons
- replace material ui components
  - button
  - modal
- get rid of styled components
- focus outline none
- don't use old Modal folder structure
- add Inter typeface
- add eslint
  - fix prop types??
- close Images when clicking on them again
- draft/public/archived/deleted

- title on dreams
- og images on dreams

- debounce searh a little bit more?
- everything is currently resaved when editing a dream, seems unnecessary..
  - possible to fix with dirtyFields
- data-loader.. event currency??
