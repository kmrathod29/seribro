const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RatingPartSchema = new Schema({
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String, maxlength: 1000 },
  ratedAt: Date,
  ratedBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

const RatingSchema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  studentRating: RatingPartSchema,
  companyRating: RatingPartSchema,
  bothRated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

RatingSchema.methods.addStudentRating = async function (rating, review, userId) {
  if (this.studentRating && this.studentRating.ratedAt) throw new Error('Student already rated');
  this.studentRating = { rating, review, ratedAt: new Date(), ratedBy: userId };
  this.updatedAt = new Date();
  this.bothRated = !!(this.studentRating && this.companyRating);
  await this.save();
  return this;
};

RatingSchema.methods.updateStudentRating = async function (rating, review) {
  if (!this.studentRating || !this.studentRating.ratedAt) throw new Error('No student rating to update');
  this.studentRating.rating = rating;
  this.studentRating.review = review;
  this.updatedAt = new Date();
  await this.save();
  return this;
};

RatingSchema.methods.addCompanyRating = async function (rating, review, userId) {
  if (this.companyRating && this.companyRating.ratedAt) throw new Error('Company already rated');
  this.companyRating = { rating, review, ratedAt: new Date(), ratedBy: userId };
  this.updatedAt = new Date();
  this.bothRated = !!(this.studentRating && this.companyRating);
  await this.save();
  return this;
};

RatingSchema.methods.updateCompanyRating = async function (rating, review) {
  if (!this.companyRating || !this.companyRating.ratedAt) throw new Error('No company rating to update');
  this.companyRating.rating = rating;
  this.companyRating.review = review;
  this.updatedAt = new Date();
  await this.save();
  return this;
};

RatingSchema.methods.checkBothRated = function () {
  this.bothRated = !!(this.studentRating && this.companyRating);
  this.updatedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Rating', RatingSchema);
