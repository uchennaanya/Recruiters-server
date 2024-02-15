class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  // FILTER
  filter() {
    const exclude = ["sort", "page", "limit", "fields"];
    const query = { ...this.queryStr };
    exclude.forEach((el) => delete query[el]);

    let queryString = JSON.stringify(query);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    const queryObj = JSON.parse(queryString);

    this.query = this.query.find(queryObj);

    return this;
  }

  // SORTING
  sort() {
    if (this.queryStr.sort) {
      let sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  
  // LIMIT
  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-password, -__v");
    }
    return this;
  }
  // PAGINATE
  paginate() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 10;

    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const countUser = await User.countDocuments();
    //   if (skip >= countUser) {
    //     throw new Error("You have reached the end.");
    //   }
    // }
    return this;
  }
}

export default ApiFeatures;
