import { Component, OnInit } from '@angular/core';

interface Comment {
  id: number;
  author: string;
  date: string;
  content: string;
  replies: Reply[];
}

interface Reply {
  id: number;
  author: string;
  date: string;
  content: string;
}

@Component({
  selector: 'app-comment',
  templateUrl: './comment.page.html',
  styleUrls: ['./comment.page.scss'],
})
export class CommentPage implements OnInit {
  constructor() {}

  ngOnInit() {}

  comments: Comment[] = [
    {
      id: 1,
      author: 'Carter',
      date: 'January 1, 2024',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      replies: [],
    },
    {
      id: 2,
      author: 'Jane Smith',
      date: 'January 2, 2024',
      content: 'Pellentesque euismod magna in velit tincidunt placerat.',
      replies: [
        {
          id: 1,
          author: 'John Doe',
          date: 'January 3, 2024',
          content:
            'Sed euismod enim in odio tristique, quis aliquet ligula eleifend.',
        },
      ],
    },
  ];

  newCommentContent: string = '';
  newReplyContent: { [commentId: number]: string } = {};
  showReplyForm: { [commentId: number]: boolean } = {};

  addComment() {
    const newComment: Comment = {
      id: this.comments.length + 1,
      author: 'Current User',
      date: new Date().toLocaleDateString(),
      content: this.newCommentContent,
      replies: [],
    };
    this.comments.push(newComment);
    this.newCommentContent = '';
  }

  deleteComment(commentId: number) {
    this.comments = this.comments.filter((comment) => comment.id !== commentId);
  }

  editComment(comment: Comment) {
    // Logique pour la modification du commentaire
  }

  addReply(commentId: number) {
    const newReply: Reply = {
      id:
        this.comments.find((comment) => comment.id === commentId)!.replies
          .length + 1,
      author: 'Current User',
      date: new Date().toLocaleDateString(),
      content: this.newReplyContent[commentId],
    };
    this.comments
      .find((comment) => comment.id === commentId)!
      .replies.push(newReply);
    this.newReplyContent[commentId] = '';
    this.showReplyForm[commentId] = false;
  }

  deleteReply(commentId: number, replyId: number) {
    const comment = this.comments.find((comment) => comment.id === commentId);
    if (comment) {
      comment.replies = comment.replies.filter((reply) => reply.id !== replyId);
    }
  }

  editReply(reply: Reply) {
    // Logique pour la modification de la réponse
  }

  toggleReplyForm(commentId: number) {
    this.showReplyForm[commentId] = !this.showReplyForm[commentId];
  }

  cancelReply(commentId: number) {
    this.showReplyForm[commentId] = false;
    this.newReplyContent[commentId] = '';
  }
}
