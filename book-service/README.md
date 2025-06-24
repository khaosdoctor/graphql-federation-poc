# Book Service

A GraphQL subgraph service for managing books and authors in a federated GraphQL architecture.

## Overview

The Book Service is responsible for managing books and authors data. It serves as one of the subgraphs in the GraphQL federation setup, providing book and author operations through a GraphQL API built with Apollo Federation v2.9.

## Features

- **Book Management**: Create, read, update, and delete books
- **Author Management**: Create, read, update, and delete authors
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

The service will be available at `http://localhost:4000/graphql`

## API Schema

### Types

- **Book**: Represents a book with title, pages, and associated authors
- **Author**: Represents an author with name, birth date, and associated books
- **Sale**: External reference to sales (handled by sale-service)

### Queries

- `books`: Fetch all books
- `book(id: Int!)`: Fetch a specific book by ID
- `authors`: Fetch all authors
- `author(id: Int!)`: Fetch a specific author by ID

### Mutations

- `addBook(title: String!, authors: [Int!]!, pages: Int!)`: Create a new book
- `updateBook(id: Int!, title: String, authors: [Int!], pages: Int)`: Update a book
- `removeBook(id: Int!)`: Delete a book
- `addAuthor(name: String!, birthDate: DateTime)`: Create a new author
- `updateAuthor(id: Int!, name: String, books: [Int!], birthDate: DateTime)`: Update an author
- `removeAuthor(id: Int!)`: Delete an author

## Project Structure

```
src/
├── generated/           # Generated Prisma client
├── graphql/
│   ├── definitions.ts   # GraphQL schema definitions
│   ├── schema.graphql   # GraphQL schema file
│   ├── errors/         # Custom GraphQL errors
│   └── resolvers/      # GraphQL resolvers
│       ├── author/     # Author-related resolvers
│       └── books/      # Book-related resolvers
└── main.ts             # Application entry point

prisma/
├── migrations/         # Database migrations
└── schema.prisma       # Prisma schema
```

## Database Schema

The service uses Prisma with the following main entities:
- Books (id, title, pages, createdAt, updatedAt)
- Authors (id, name, birthDate, createdAt, updatedAt)
- Book-Author relationships (many-to-many)

## Federation Integration

This service is designed to work with:
- **Federation Router**: Aggregates multiple subgraphs
- **Sale Service**: Handles sales data with book references

The service provides the `Book` entity as a federated type that can be extended by other services.

## Example Queries

### Get all books with their authors

```graphql
query {
  books {
    id
    title
    pages
    authors {
      id
      name
      birthDate
    }
  }
}
```

### Add a new book

```graphql
mutation {
  addBook(title: "The Great Gatsby", authors: [1], pages: 180) {
    id
    title
    pages
    authors {
      name
    }
  }
}
```

### Add a new author

```graphql
mutation {
  addAuthor(name: "F. Scott Fitzgerald", birthDate: "1896-09-24") {
    id
    name
    birthDate
  }
}
