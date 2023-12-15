# graph-pilot

This is a project created during a Learning Day to try to write an app with ChatGPT 4 and Github CoPilot (Chat).

The idea is to be able to display a graph from a user supplied text input.

The app would then parse it and display the graph.

The edges show the length of longest common string from that is both a suffix from the source as well as a prefix from the target.

The user can then select a path through the graph on valid edges.

Try it out at https://leonard84.github.io/graph-pilot/ you can use this [sample input](https://gist.github.com/leonard84/05a48ebde0d71d8406fbf46aa7af7a5f).

## Example

> calculateEdgeWeight("OAAGO", "AAGG")
> 
> There's no overlap between the suffix of "OAAGO" and the prefix of "AAGG". The longest common substring at the end of "OAAGO" does not start at the beginning of "AAGG".
> Expected result: `0`.
> calculateEdgeWeight("OAAGO", "OAAO")
> 
> The overlap is just the first character 'O', which is the last character of "OAAGO" and the first character of "OAAO".
> Expected result: `1`.
> calculateEdgeWeight("OAAGO", "GOAA")
> 
> The overlap is "GO", which is the last two characters of "OAAGO" and the first two characters of "GOAA".
> Expected result: `2`.
> calculateEdgeWeight("OAAGO", "AGOAA":
> 
> The overlap is "AGO", which is the last three characters of "OAAGO" and the first three characters of "AGOAA".
> Expected result: `3`.



## Development
To install dependencies:

```bash
bun install
```

To run:

```bash
bun bundle
```

then open `build/index.html`