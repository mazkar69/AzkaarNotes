# MongoDB Aggregation Pipeline

> Last Updated: February 22, 2026

## Table of Contents
- [What is Aggregation](#what-is-aggregation)
- [Common Stages](#common-stages)
- [$match](#match)
- [$group](#group)
- [$project](#project)
- [$sort and $limit](#sort-and-limit)
- [$lookup (Join)](#lookup-join)
- [$unwind](#unwind)
- [$addFields](#addfields)
- [Practical Examples](#practical-examples)
- [Mongoose Usage](#mongoose-usage)

---

## What is Aggregation

Aggregation processes documents through a pipeline of stages. Each stage transforms the data and passes the result to the next stage.

```javascript
db.collection.aggregate([
  { $match: { ... } },     // Stage 1: Filter
  { $group: { ... } },     // Stage 2: Group
  { $sort: { ... } },      // Stage 3: Sort
  { $project: { ... } },   // Stage 4: Shape output
]);
```

---

## Common Stages

| Stage | Purpose |
|-------|---------|
| `$match` | Filter documents (like `find`) |
| `$group` | Group by field and calculate aggregates |
| `$project` | Include/exclude/reshape fields |
| `$sort` | Sort results |
| `$limit` | Limit number of results |
| `$skip` | Skip documents (pagination) |
| `$lookup` | Join with another collection |
| `$unwind` | Deconstruct an array field |
| `$addFields` | Add new computed fields |
| `$count` | Count documents |
| `$facet` | Run multiple pipelines in parallel |

---

## $match

Filter documents. Place `$match` as early as possible for performance.

```javascript
// All orders with status "completed"
db.orders.aggregate([
  { $match: { status: "completed" } }
]);

// Orders in a date range
db.orders.aggregate([
  {
    $match: {
      createdAt: {
        $gte: new Date("2025-01-01"),
        $lt: new Date("2026-01-01"),
      },
    },
  },
]);
```

---

## $group

Group documents by a field and compute aggregate values.

```javascript
// Total revenue per product
db.orders.aggregate([
  {
    $group: {
      _id: "$productId",
      totalRevenue: { $sum: "$amount" },
      count: { $sum: 1 },
      avgAmount: { $avg: "$amount" },
      maxAmount: { $max: "$amount" },
      minAmount: { $min: "$amount" },
    },
  },
]);

// Total across all documents (use _id: null)
db.orders.aggregate([
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: "$amount" },
      totalOrders: { $sum: 1 },
    },
  },
]);
```

### Group Operators

| Operator | Description |
|----------|-------------|
| `$sum` | Sum values or count (`$sum: 1`) |
| `$avg` | Average |
| `$max` | Maximum value |
| `$min` | Minimum value |
| `$first` | First document in group |
| `$last` | Last document in group |
| `$push` | Collect values into an array |
| `$addToSet` | Collect unique values into an array |

---

## $project

Reshape documents. Include, exclude, or compute fields.

```javascript
db.users.aggregate([
  {
    $project: {
      _id: 0,                            // Exclude _id
      fullName: {                          // Computed field
        $concat: ["$firstName", " ", "$lastName"],
      },
      email: 1,                            // Include email
      year: { $year: "$createdAt" },       // Extract year from date
    },
  },
]);
```

---

## $sort and $limit

```javascript
// Top 5 highest spending customers
db.orders.aggregate([
  {
    $group: {
      _id: "$customerId",
      totalSpent: { $sum: "$amount" },
    },
  },
  { $sort: { totalSpent: -1 } },   // -1 = descending, 1 = ascending
  { $limit: 5 },
]);
```

### Pagination with $skip and $limit

```javascript
const page = 2;
const limit = 10;

db.products.aggregate([
  { $match: { category: "electronics" } },
  { $sort: { price: -1 } },
  { $skip: (page - 1) * limit },
  { $limit: limit },
]);
```

---

## $lookup (Join)

Join documents from another collection. Similar to SQL JOIN.

```javascript
// Get orders with user details
db.orders.aggregate([
  {
    $lookup: {
      from: "users",           // Collection to join
      localField: "userId",    // Field in orders
      foreignField: "_id",     // Field in users
      as: "user",              // Output array field name
    },
  },
  { $unwind: "$user" },       // Convert array to object
  {
    $project: {
      orderNumber: 1,
      amount: 1,
      "user.name": 1,
      "user.email": 1,
    },
  },
]);
```

### $lookup with Pipeline (advanced)

```javascript
db.orders.aggregate([
  {
    $lookup: {
      from: "products",
      let: { productId: "$productId" },
      pipeline: [
        { $match: { $expr: { $eq: ["$_id", "$$productId"] } } },
        { $project: { name: 1, price: 1 } },
      ],
      as: "product",
    },
  },
]);
```

---

## $unwind

Deconstruct an array field, creating one document per array element.

```javascript
// Document: { name: "John", hobbies: ["reading", "coding", "gaming"] }

db.users.aggregate([
  { $unwind: "$hobbies" },
]);

// Output:
// { name: "John", hobbies: "reading" }
// { name: "John", hobbies: "coding" }
// { name: "John", hobbies: "gaming" }

// Count most popular hobbies
db.users.aggregate([
  { $unwind: "$hobbies" },
  { $group: { _id: "$hobbies", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);
```

---

## $addFields

Add new fields without removing existing ones (unlike $project).

```javascript
db.products.aggregate([
  {
    $addFields: {
      discountedPrice: {
        $multiply: ["$price", 0.9],    // 10% discount
      },
      isExpensive: {
        $cond: { if: { $gt: ["$price", 1000] }, then: true, else: false },
      },
    },
  },
]);
```

---

## Practical Examples

### Monthly Revenue Report

```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      },
      totalRevenue: { $sum: "$amount" },
      orderCount: { $sum: 1 },
      avgOrderValue: { $avg: "$amount" },
    },
  },
  { $sort: { "_id.year": -1, "_id.month": -1 } },
]);
```

### User Registration Stats by Day

```javascript
db.users.aggregate([
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      count: { $sum: 1 },
    },
  },
  { $sort: { _id: -1 } },
  { $limit: 30 },
]);
```

### Products with Category Details and Average Rating

```javascript
db.products.aggregate([
  {
    $lookup: {
      from: "categories",
      localField: "categoryId",
      foreignField: "_id",
      as: "category",
    },
  },
  { $unwind: "$category" },
  {
    $lookup: {
      from: "reviews",
      localField: "_id",
      foreignField: "productId",
      as: "reviews",
    },
  },
  {
    $addFields: {
      avgRating: { $avg: "$reviews.rating" },
      reviewCount: { $size: "$reviews" },
    },
  },
  {
    $project: {
      name: 1,
      price: 1,
      "category.name": 1,
      avgRating: { $round: ["$avgRating", 1] },
      reviewCount: 1,
    },
  },
  { $sort: { avgRating: -1 } },
]);
```

---

## Mongoose Usage

```javascript
// In a controller
const result = await Order.aggregate([
  { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
  {
    $group: {
      _id: null,
      totalOrders: { $sum: 1 },
      totalSpent: { $sum: "$amount" },
    },
  },
]);

// Note: In Mongoose aggregation, you must use `new mongoose.Types.ObjectId()`
// for matching _id fields, not plain strings.
```
