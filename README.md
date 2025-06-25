# GraphQL Federation POC

A proof-of-concept implementation of GraphQL Federation using Apollo Federation v2.9 with multiple microservices.

> There are two tags in this service, one is [standalone](https://github.com/hemnet/graphql-federation-poc/releases/tag/standalone) which is both services acting as different entities and the [federated](https://github.com/hemnet/graphql-federation-poc/releases/tag/federated) which provides one single graph for both

## Overview

This project demonstrates a complete GraphQL Federation setup with multiple specialized services that work together to provide a unified GraphQL API. The architecture follows a microservices pattern where each service owns specific business domains and data models.

## Architecture

The project implements a federated GraphQL architecture with the following services:

```
┌─────────────────────────────────────────────┐
│              Client Applications              │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│         Federation Router (port 3000)        │
│         Apollo Gateway + Apollo Server       │
└─────────────────┬───────────────────────────┘
                  │
         ┌────────┴────────┐
         ▼                 ▼
┌─────────────────┐ ┌─────────────────┐
│  Book Service   │ │  Sale Service   │
│   (port 4000)   │ │   (port 4001)   │
│                 │ │                 │
│ - Books         │ │ - Sales         │
│ - Authors       │ │ - Sale Products │
│ - CRUD Ops      │ │ - Payment Status│
└─────────────────┘ └─────────────────┘
         │                 │
         ▼                 ▼
┌─────────────────┐ ┌─────────────────┐
│   PostgreSQL    │ │   PostgreSQL    │
│   (Shared DB)   │ │   (Shared DB)   │
└─────────────────┘ └─────────────────┘
```

## Services

### 🔗 [Federation Router](./federation-router/)
- **Port**: 3000
- **Purpose**: GraphQL Federation gateway
- **Technology**: Apollo Gateway + Apollo Server
- **Responsibilities**: Schema composition, query planning, service orchestration

### 📚 [Book Service](./book-service/)
- **Port**: 4000  
- **Purpose**: Manages books and authors
- **Technology**: Apollo Server + Prisma + PostgreSQL
- **Entities**: Book, Author
- **Operations**: Full CRUD for books and authors

### 💰 [Sale Service](./sale-service/)
- **Port**: 4001
- **Purpose**: Manages sales transactions
- **Technology**: Apollo Server + Prisma + PostgreSQL  
- **Entities**: Sale, SaleProduct
- **Operations**: Create sales, manage products, track payment status

## Key Features

- **GraphQL Federation**: Uses Apollo Federation v2.9 for service composition
- **Microservices Architecture**: Each service owns its domain and database
- **Type Safety**: Full TypeScript implementation across all services
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- **Cross-Service Relationships**: Books can be referenced in sales across services
- **Unified API**: Single GraphQL endpoint for all operations

## Prerequisites

- **Node.js** v22+
- **Docker** and **Docker Compose**
- **npm** package manager

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd graphql-federation-poc
   ```

2. **Start the database**
   ```bash
   docker-compose up -d
   ```

3. **Set up each service**
   
   For each service directory (`book-service`, `sale-service`, `federation-router`):
   ```bash
   cd <service-directory>
   npm install
   
   # For services with Prisma (book-service, sale-service)
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Start all services**
   
   **Terminal 1 - Book Service:**
   ```bash
   cd book-service
   npm start
   ```
   
   **Terminal 2 - Sale Service:**
   ```bash
   cd sale-service  
   npm start
   ```
   
   **Terminal 3 - Federation Router:**
   ```bash
   cd federation-router
   npm start
   ```

5. **Access the API**
   - **Federation Gateway**: http://localhost:3000/graphql
   - **Book Service**: http://localhost:4000/graphql
   - **Sale Service**: http://localhost:4001/graphql

## Example Queries

### Cross-Service Query (via Federation Router)

```graphql
query {
  books {
    id
    title
    pages
    authors {
      name
      birthDate
    }
    sales {
      id
      status
      customerId
      items {
        quantity
        priceCent
      }
    }
  }
}
```

### Create a Book and Sale

```graphql
# 1. First, create an author (book-service)
mutation {
  addAuthor(name: "George Orwell", birthDate: "1903-06-25") {
    id
    name
  }
}

# 2. Create a book (book-service)
mutation {
  addBook(title: "1984", authors: [1], pages: 328) {
    id
    title
    authors {
      name
    }
  }
}

# 3. Create a sale (sale-service)
mutation {
  newSale(
    customerId: 123,
    products: [{
      productId: 1,
      productType: "BOOK",
      quantity: 1,
      priceCent: 1299
    }]
  ) {
    id
    status
    items {
      product {
        title
      }
      quantity
      priceCent
    }
  }
}
```

## Tech Stack

- **GraphQL**: Apollo Federation v2.9
- **Backend**: Node.js with TypeScript
- **Framework**: Express.js v5
- **ORM**: Prisma v6
- **Database**: PostgreSQL 17
- **Gateway**: Apollo Gateway
- **Server**: Apollo Server v4

## Development

### Project Structure
```
graphql-federation-poc/
├── book-service/           # Book and author management service
│   ├── src/
│   ├── prisma/
│   └── package.json
├── sale-service/           # Sales management service  
│   ├── src/
│   ├── prisma/
│   └── package.json
├── federation-router/      # GraphQL Federation gateway
│   ├── src/
│   └── package.json
├── docker-compose.yml      # PostgreSQL database
└── README.md
```

### Key Federation Concepts Demonstrated

1. **Entity Extension**: The `Book` type is defined in book-service and extended in sale-service
2. **Cross-Service References**: Sales can reference books from another service  
3. **Unified Schema**: Single GraphQL schema composed from multiple services
4. **Service Autonomy**: Each service manages its own data and business logic
5. **Type Federation**: Shared types across service boundaries

## Environment Variables

Create `.env` files in each service directory:

```env
# book-service/.env & sale-service/.env
DATABASE_URL="postgresql://root:root@localhost:5432/bookstore"
```

## Contributing

This is a proof-of-concept project demonstrating GraphQL Federation patterns. Feel free to explore the code and experiment with the federation setup.

## License

MIT License - see individual service directories for specific license information.

## Author

Lucas Santos <hello@lsantos.dev> (https://lsantos.dev/)
