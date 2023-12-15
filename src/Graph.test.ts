import { describe, expect, test } from "bun:test";
import Graph from "./Graph";

describe("Graph", () => {
    describe("calculateEdgeWeights", () => {
        test("no overlap", () => {
            expect(Graph.calculateEdgeWeight("OAAGO", "AAGG")).toEqual(0)
        });
        test("one overlap", () => {            
            expect(Graph.calculateEdgeWeight("OAAGO", "OAAO")).toEqual(1)
        });
        test("two overlap", () => {            
            expect(Graph.calculateEdgeWeight("OAAGO", "GOAA")).toEqual(2)
        });
        test("three overlap", () => {            
            expect(Graph.calculateEdgeWeight("OAAGO", "AGOAA")).toEqual(3)
        });
    });
});