# Pagination — MongoDB (Mongoose)

> **Purpose:** Reusable pagination helpers for MongoDB `find` queries and aggregation pipelines. Returns consistent pagination metadata with every response.

---

## Table of Contents

1. [paginateMongo — find() Pagination](#paginatemongo--find-pagination)
2. [paginateAggregate — Aggregation Pagination](#paginateaggregate--aggregation-pagination)
3. [Route Example with Filtering](#route-example-with-filtering)
4. [Response Shape](#response-shape)
5. [Frontend Query Examples](#frontend-query-examples)

---

## paginateMongo — find() Pagination

> Use for standard `Model.find()` queries with optional filtering, sorting, population, and field selection.

```js
/**
 * Paginate MongoDB find() results
 * @param {Model}  model   - Mongoose model
 * @param {Object} query   - MongoDB filter
 * @param {Object} options - Pagination options
 */
export const paginateMongo = async (model, query = {}, options = {}) => {
    const page     = parseInt(options.page)  || 1;
    const limit    = parseInt(options.limit) || 10;
    const skip     = (page - 1) * limit;
    const sort     = options.sort     || { createdAt: -1 };
    const select   = options.select   || "";
    const populate = options.populate || "";

    const [data, totalDocs] = await Promise.all([
        model
            .find(query)
            .select(select)
            .populate(populate)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        model.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    return {
        success: true,
        data,
        pagination: {
            currentPage:  page,
            totalPages,
            totalDocs,
            limit,
            hasNextPage:  page < totalPages,
            hasPrevPage:  page > 1,
            nextPage:     page < totalPages ? page + 1 : null,
            prevPage:     page > 1         ? page - 1 : null,
        },
    };
};
```

---

## paginateAggregate — Aggregation Pagination

> Use when you need `$lookup`, `$group`, `$project`, or complex transforms before paginating.
> Uses `$facet` to run data fetch and count in a **single DB query**.

```js
/**
 * Paginate MongoDB aggregation results
 * @param {Model} model    - Mongoose model
 * @param {Array} pipeline - Aggregation stages (before pagination)
 * @param {Object} options - Pagination options
 */
export const paginateAggregate = async (model, pipeline = [], options = {}) => {
    const page  = parseInt(options.page)  || 1;
    const limit = parseInt(options.limit) || 10;
    const skip  = (page - 1) * limit;

    const paginatedPipeline = [
        ...pipeline,
        {
            $facet: {
                data:       [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: "count" }],
            },
        },
    ];

    const result   = await model.aggregate(paginatedPipeline);
    const data     = result[0]?.data || [];
    const totalDocs = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalDocs / limit);

    return {
        success: true,
        data,
        pagination: {
            currentPage:  page,
            totalPages,
            totalDocs,
            limit,
            hasNextPage:  page < totalPages,
            hasPrevPage:  page > 1,
            nextPage:     page < totalPages ? page + 1 : null,
            prevPage:     page > 1         ? page - 1 : null,
        },
    };
};
```

---

## Route Example with Filtering

```js
import asyncHandler from "./asyncHandler.js";
import { paginateMongo } from "./pagination.js";
import Category from "../models/category.model.js";

export const getCategories = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, status } = req.query;

    const filter = {};

    if (search) {
        filter.$or = [
            { name:  { $regex: search, $options: "i" } },
            { slug:  { $regex: search, $options: "i" } },
        ];
    }

    if (status) {
        filter.isActive = status === "active";
    }

    const result = await paginateMongo(Category, filter, {
        page,
        limit,
        sort: { createdAt: -1 },
    });

    res.status(200).json(result);
});
```

---

## Aggregation Example

```js
import { paginateAggregate } from "./pagination.js";
import Order from "../models/order.model.js";

export const getOrdersWithUser = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const pipeline = [
        { $match: { status: "completed" } },
        {
            $lookup: {
                from:         "users",
                localField:   "userId",
                foreignField: "_id",
                as:           "user",
            },
        },
        { $unwind: "$user" },
        { $project: { "user.password": 0 } }, // Exclude password
    ];

    const result = await paginateAggregate(Order, pipeline, { page, limit });

    res.status(200).json(result);
});
```

---

## Response Shape

```json
{
  "success": true,
  "data": [ ...documents ],
  "pagination": {
    "currentPage": 2,
    "totalPages": 10,
    "totalDocs": 98,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": true,
    "nextPage": 3,
    "prevPage": 1
  }
}
```

---

## Frontend Query Examples

```js
// Axios
const res = await axios.get("/api/categories", {
    params: { page: 2, limit: 10, search: "electronics", status: "active" },
});

const { data, pagination } = res.data;
```

```
GET /api/categories?page=2&limit=10&search=electronics&status=active
```

---

## Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `page` | `number` | `1` | Current page number |
| `limit` | `number` | `10` | Documents per page |
| `sort` | `Object` | `{ createdAt: -1 }` | Sort order |
| `select` | `string` | `""` | Fields to include/exclude |
| `populate` | `string` | `""` | Fields to populate |
