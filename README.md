# dataviscourse-pr-manufacturing-vis
CS 6630 Final Project

Final submission code files can be found in the `finalSubmission/` directory. Our updated process book, however, is in `files/` like all our previous submissions.

- Video Overview: https://www.youtube.com/watch?v=-XE7y0xJACw
- GitHub Pages site: https://faris-k.github.io/dataviscourse-pr-manufacturing-vis/finalSubmission/
- Video showing updated homepage: https://youtu.be/upotLY9mLJo

## Non-Obvious Functionality
There are three primary visualizations that can be accessed using the three buttons on the sidebar:
- Visualize Equipment Model
- Analyze Trace Data
- Analyze Event Data

**Visualize Equipment Model** and **Analyze Trace Data** can just be clicked, and the corresponding visualizations will be displayed. **Analyze Event Data**, on the other hand, first initializes the backend for two of our visualizations. It does not display anything to the screen. This button is color-coded blue, and there are two other blue buttons that actually display the visualizations once the initialization is complete:

- Node Visit Timing
- Recipe Execution Timing

These two buttons (outlined in blue, in the middle of the page) only work when the **Analyze Event Data** button is clicked first. Initialization of the event data only needs to be done once. Besides clicking **Analyze Event Data** before **Node Visit Timing** or **Recipe Execution Timing**, the other buttons can be clicked in any order. Visualizations will be removed and displayed accordingly.