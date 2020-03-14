import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import Card from "./styled/Card";
import Link from "next/link";
import { useRouter } from "next/router";
import { modals } from "./Modal";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper
  },
  inline: {
    display: "inline"
  }
}));

const Item = ({ author, content, avatar }) => {
  const classes = useStyles();

  return (
    <>
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Avatar alt={`${author} avatar`} src={avatar} />
        </ListItemAvatar>
        <ListItemText primary={author} secondary={content} />
      </ListItem>
      <Divider variant="inset" component="li" />
    </>
  );
};

const CommentBox = ({ comments, openModal }) => {
  const classes = useStyles();
  const router = useRouter();
  console.log({ comments });

  return (
    <Card>
      <List className={classes.root}>
        {comments.map((comment, index) => (
          <Item
            content={comment.content}
            author={comment.author.name}
            avatar={comment.author.avatar}
            key={index}
          />
        ))}
        <ListItem>
          <a
            onClick={() => {
              openModal(modals.ADD_COMMENT);
            }}
          >
            + Add comment
          </a>
        </ListItem>
      </List>
    </Card>
  );
};

export default CommentBox;
