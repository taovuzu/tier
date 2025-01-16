import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    owner: {
      type: String,
      required: true,
    },
    subtier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subtier",
      required: true,
    },
    title: {
      type: String,
      required: true,
      minLength: [3, "Length should be between 3-50 characters"],
      maxLength: [50, "Length should be between 3-50 characters"],
    },
    spoiler: {
      type: Boolean,
      default: false,
    },
    contentType: {
      type: String,
      enum: ["VIDEO", "IMAGE", "TEXT"],
      required: true,
    },
    content: {
      type: String,
      default: "", // For TEXT content
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true }, // To support deletion from a cloud storage provider
      },
    ],
    videos: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true }, // To support deletion from a cloud storage provider
      },
    ],    
    matureContent: {
      type: Boolean,
      default: false,
    },
    upVotesCount: {
      type: Number,
      default: 0,
    },
    downVotesCount: {
      type: Number,
      default: 0,
    },
    view: {
      type: Number,
      default: 0,
    },
    deletionFlag: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


// // Middleware to include flair details
// postSchema.pre("save", async function (next) {
//   if (this.flair && this.subtier) {
//     // Fetch the associated subtier
//     const subtier = await mongoose.model("Subtier").findById(this.subtier);
//     if (!subtier) {
//       throw new Error(`Subtier with ID ${this.subtier} does not exist.`);
//     }

//     // Check if the flair exists in the subtier
//     const flairDetails = subtier.flairs.find((flair) => flair.name === this.flair.name);
//     if (!flairDetails) {
//       throw new Error(`Flair "${this.flair.name}" is not valid for the subtier "${subtier.subtierUsername}".`);
//     }

//     // Include flair details in the post
//     this.flair.color = flairDetails.color;
//   }
//   next();
// });

postSchema.pre(/^find/, function (next) {
  this.where({ deletionFlag: false });
  next();
});

postSchema.plugin(mongooseAggregatePaginate);

export const Post = mongoose.model("Post", postSchema);
