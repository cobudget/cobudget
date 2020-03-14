import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  TextField,
  List,
  ListItem,
  Divider,
  ListItemText,
  ListItemAvatar,
  Typography
} from "@material-ui/core";
import Avatar from "./Avatar";
import Card from "./styled/Card";
import Link from "next/link";
import { modals } from "./Modal";
import AddComment from "./AddComment";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper
  },
  inline: {
    display: "inline"
  }
}));

const Comment = ({ author, content, avatar }) => {
  return (
    <>
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Avatar user={author} />
        </ListItemAvatar>
        <ListItemText primary={author.name} secondary={content} />
      </ListItem>
      <Divider variant="inset" component="li" />
    </>
  );
};

const Comments = ({ currentMember, dream }) => {
  const classes = useStyles();

  return (
    <List className={classes.root}>
      {dream.comments.map((comment, index) => (
        <Comment
          content={comment.content}
          author={comment.author}
          key={index}
        />
      ))}
      {currentMember && (
        <AddComment currentMember={currentMember} dream={dream} />
      )}
      {/* <ListItem>
          <a
            onClick={() => {
              openModal(modals.ADD_COMMENT);
            }}
          >
            + Add comment
          </a>
        </ListItem> */}
    </List>
  );
};

export default Comments;
