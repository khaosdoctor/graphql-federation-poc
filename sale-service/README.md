# Sale Service

A GraphQL subgraph service for managing sales transactions in a federated GraphQL architecture.

## Overview

The Sale Service handles all sales-related operations, including creating sales, managing sale products, and tracking payment status. It extends the `Book` entity from the book-service to create relationships between books and sales.

## Features

- **Sales Management**: Create, read, update, and complete sales
- **Product Management**: Add and remove products from sales
- **Payment Status Tracking**: PENDING, COMPLETED, CANCELLED statuses
- **GraphQL Federation**: Implements Apollo Federation v2.9 specifications
- **Database**: Uses Prisma ORM with PostgreSQL
- **Type Safety**: Built with TypeScript

## Tech Stack

- **Node.js** with TypeScript
- **GraphQL** with Apollo Server v4 + Apollo Subgraph
- **Prisma** ORM with PostgreSQL
- **Express** v5 for HTTP server
- **Apollo Federation** v2.9

## Prerequisites

- Node.js (v22+)
- Docker and Docker Compose
- npm

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="postgresql://root:root@localhost:5432/bookstore"
   ```

3. **Run database migrations**

   ```bash
   npx prisma migrate dev
   ```

4. **Generate Prisma client**

   ```bash
   npx prisma generate
   ```

## Running

Start the development server:

```bash
npm start
```

The service will be available at `http://localhost:4001/graphql`

## API Schema

### Types

- **Sale**: Represents a sales transaction with customer, status, and products
- **SaleProduct**: Represents a product (book) within a sale with quantity and price
- **PaymentStatus**: Enum for sale status (PENDING, COMPLETED, CANCELLED)
- **Book**: Extended from book-service to show sales relationships

### Queries

- `sales`: Fetch all sales
- `sale(id: Int!)`: Fetch a specific sale by ID

### Mutations

- `newSale(customerId: Int!, products: [SaleProductInput!]!)`: Create a new sale
- `completeSale(id: Int!)`: Mark a sale as completed
- `cancelSale(id: Int!)`: Cancel a sale
- `addProductToSale(id: Int!, products: [SaleProductInput!]!)`: Add products to an existing sale
- `removeProductFromSale(id: Int!, productIds: [Int]!)`: Remove products from a sale

## Project Structure

```
src/
├── generated/           # Generated Prisma client
├── graphql/
│   ├── definitions.ts   # GraphQL schema definitions
│   ├── schema.graphql   # GraphQL schema file
│   ├── errors/         # Custom GraphQL errors
│   └── resolvers/      # GraphQL resolvers
│       ├── sales/      # Sale-related resolvers
│       └── saleProducts/ # Sale product-related resolvers
└── main.ts             # Application entry point

prisma/
├── migrations/         # Database migrations
└── schema.prisma       # Prisma schema
```

## Database Schema

The service uses Prisma with the following main entities:
- Sales (id, customerId, status, createdAt, updatedAt)
- SaleProducts (productId, productType, quantity, priceCent, createdAt, updatedAt)
- Sale-Product relationships (one-to-many)

## Federation Integration

This service:
- **Extends Book type** from book-service to add sales relationships
- **Works with Federation Router** for query composition
- **References Book entities** from book-service through federation

The service provides the `Sale` entity and extends the `Book` entity with sales data.

## Example Queries

### Get all sales with their products

```graphql
query {
  sales {
    id
    customerId
    status
    createdAt
    items {
      product {
        id
        title
      }
      quantity
      priceCent
    }
  }
}
```

### Create a new sale

```graphql
mutation {
  newSale(
    customerId: 123
    products: [
      {
        productId: 1
        productType: "BOOK"
        quantity: 2
        priceCent: 1999
      }
    ]
  ) {
    id
    customerId
    status
    items {
      quantity
      priceCent
    }
  }
}
```

### Complete a sale

```graphql
mutation {
  completeSale(id: 1) {
    id
    status
  }
}
