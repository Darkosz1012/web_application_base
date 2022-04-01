import { Neo4jGraphQL } from "@neo4j/graphql"
import { ApolloServer, gql } from "apollo-server"
import neo4j from "neo4j-driver"
import dotenv from 'dotenv'

dotenv.config()

const typeDefs = gql`
    type Movie {
        title: String
        actors: [Actor!]! @relationship(type: "ACTED_IN", direction: IN)
    }

    type Actor {
        name: String
        movies: [Movie!]! @relationship(type: "ACTED_IN", direction: OUT)
    }
`;

const driver = neo4j.driver(
    "neo4j+s://bdf776cd.databases.neo4j.io",
    neo4j.auth.basic("neo4j", "O4OJRDuU8UVr3PlICgDSxlD7XbdVK_xWju4mHK2JVTA")
);

const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

neoSchema.getSchema().then((schema) => {
    const server = new ApolloServer({
        schema,
    });
  
    server.listen().then(({ url }) => {
        console.log(`🚀 Server ready at ${url}`);
    });
  })