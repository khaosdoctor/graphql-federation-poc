import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";

const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
        subgraphs: [
            { name: 'books', url: 'http://localhost:4000/graphql' },
            { name: 'authors', url: 'http://localhost:4001/graphql' }
        ],
    })
})

const server = new ApolloServer({ gateway })

const { url } = await startStandaloneServer(server, { listen: { port: 3000 } })

console.log(`🚀 Federation Gateway ready at ${url}`)

