Steam game descriptions are embedded with a Sentence Transformer and visualized using multiple dimension reduction techniques, including PCA, t-SNE, and PaCMAP, to explore how games cluster by their content.

The model is also fine-tuned on a variety of generated queries so that games can be searched by genre, and LIME is used to explain which parts of a query and description led to a game being matched. The data comes from the Steam Games Dataset on Kaggle.

## Features

- Sentence Transformer (SBERT) embeddings of game descriptions
- Visualizations with PCA, t-SNE, and PaCMAP dimension reduction
- Fine-tuned on generated queries to support genre-based game search
- LIME explanations for why a game matches a search query
