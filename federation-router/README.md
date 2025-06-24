# Federation Router

A GraphQL Federation gateway that combines multiple subgraph services into a unified API.

## Overview

The Federation Router serves as the entry point for the GraphQL federation architecture. It automatically discovers and composes schemas from multiple subgraph services, providing a single unified GraphQL API endpoint.

## Features

- **Schema Composition**: Automatically composes schemas from multiple subgraphs
- **Service Discovery**: Uses Apollo Gateway with IntrospectAndCompose
- **Unified API**: Single endpoint for all federated services
- **Apollo Server**: Built on Apollo Server v4
- **TypeScript**: Full TypeScript support

## Tech Stack

- **Node.js** with TypeScript
- **Apollo Gateway** for federation
- **Apollo Server** v4 for GraphQL server
- **IntrospectAndCompose** for schema composition

## Configuration

The router is configured to discover and compose the following subgraphs:

- **Books Service**: `http://localhost:4000/graphql`
- **Authors Service**: `http://localhost:4001/graphql` (Note: This should be the sale-service)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Ensure subgraph services are running**
   
   Make sure both the book-service and sale-service are running on their respective ports before starting the router.

## Running

Start the federation router:

```bash
npm start
```

The unified GraphQL API will be available at `http://localhost:3000/graphql`

## Project Structure

```
bin/                    # Binary router experiments (see Router Implementation Notes)
src/
└── main.ts             # Application entry point with gateway configuration
```

## Router Implementation Notes

The `bin/` folder contains experimental implementations that were tested during development to evaluate different router approaches:

- **Apollo Router Binary**: The official Apollo Router (Rust-based) for high-performance federation
- **NPM Library Approach**: The current implementation using Apollo Gateway as an NPM library

After testing both approaches, **the NPM library implementation was chosen** for this POC because it provides:
- Better integration with Node.js/TypeScript ecosystem
- More explicit and granular control over the gateway configuration
- Easier customization and middleware integration

However, there are trade-offs to consider:
- **NPM Library**: Better integrated and more explicit, but **poorly documented**
- **Binary Router**: Well-documented but operates as a **black box** with less control

For this POC, the explicitness and integration benefits of the NPM approach outweighed the documentation limitations.

## Usage

Once running, you can query across multiple services through the single federation endpoint:

### Cross-service query example

```graphql
query {
  books {
    id
    title
    authors {
      name
    }
    sales {
      id
      status
      customerId
    }
  }
}
```

### Service-specific queries

```graphql
# From book-service
query {
  authors {
    id
    name
    books {
      title
    }
  }
}

# From sale-service  
query {
  sales {
    id
    status
    items {
      product {
        title
      }
      quantity
    }
  }
}
```

## Architecture

The Federation Router acts as the gateway in the federated architecture:

```
Client
  ↓
Federation Router (port 3000)
  ↓
┌─────────────────┬─────────────────┐
│  Book Service   │  Sale Service   │
│  (port 4000)    │  (port 4001)    │
└─────────────────┴─────────────────┘
```

## Development Notes

- The router automatically handles schema stitching and query planning
- It resolves federated entities across services
- Schema changes in subgraphs are automatically detected and composed
- The router handles cross-service entity resolution seamlessly