import mongoose ,{Schema} from "mongoose";


const postSchema = new Schema(
  {
    owner: {
      type: String,
      required: true,
    },
    subtier : {
      type: String,
      required: true,
    },
    title : {
      type: String,
      required: true,
      minLength: [3, "Length should be between 3-50 characters"],
      maxLength: [50, "Length should be between 3-50 characters"],
    },
    spoiler : {
      type: Boolean,
      default: false
    },
    contentType: {
      types: ["VIDEO","IMAGE","TEXT"],
      required: true
    },
    content: {
      type: String,
      required: true,
      set: function (value) {
        return this.deletionFlag ? "[deleted]" : value;
      },
    },
    matureContent: {
      type: Boolean,
      default: false
    },
    upVotesCount: {
      type: Number,
      default: 0
    },
    downVotesCount: {
      type: Number,
      default: 0
    },
    view:{
      type: Number,
      default: 0
    },
    deletionFlag: {
      type: Boolean,
      default: false
    },
  },{timestamps: true}
);

export const Post = mongoose.model("Post", postSchema);
