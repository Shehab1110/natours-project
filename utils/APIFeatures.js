/* eslint-disable node/no-unsupported-features/es-syntax */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = JSON.stringify(this.queryString.sort).split(',').join(' ');
      this.query = this.query.sort(JSON.parse(sortBy));
    } else {
      this.query = this.query.sort('-createdAt'); // To sort by the newest
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = JSON.stringify(this.queryString.fields)
        .split(',')
        .join(' ');
      this.query = this.query.select(JSON.parse(fields));
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
