import { Neo4jGraphQL } from "@neo4j/graphql"
import { ApolloServer, gql } from "apollo-server"
import neo4j from "neo4j-driver"
import dotenv from 'dotenv'
import OGM from '@neo4j/graphql-ogm'
import schemaql from "./graphql/schema.js";


dotenv.config()

;(async () => {
    const driver = neo4j.driver(
        process.env.NEO4J_URI || 'bolt://localhost:7687',
        neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'neo4j'
        )
    );
    const ogm = new OGM.OGM({typeDefs: schemaql.typeDefs, driver })
    ogm.init()
    // const neoSchema = new Neo4jGraphQL({ typeDefs, driver });
    const neoSchema = new Neo4jGraphQL({
        typeDefs: schemaql.typeDefs,
        driver,
        resolvers : schemaql.resolvers(ogm, driver),
        config: {
        jwt: {
            secret: process.env.GRAPHQL_SERVER_SECRET || '123456',
        },
        auth: {
            isAuthenticated: true,
        },
        },
    })

    neoSchema.getSchema().then((schema) => {
        const server = new ApolloServer({
            context: ({ req }) => {
                return {
                driver,
                driverConfig: { database: process.env.NEO4J_DATABASE || 'neo4j' },
                req,
                }
            },
            schema: schema,
            //   introspection: true,
            //   playground: true,
        });
    
        server.listen().then(({ url }) => {
            console.log(`🚀 Server ready at ${url}`);
        });
    })
})()