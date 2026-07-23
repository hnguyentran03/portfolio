Semantic search over the Steam catalog: describe the mechanics, mood, or setting you want in plain language, and the app returns the closest games in embedding space — then shows *why* each one matched and *where* it sits on a map of the whole catalog. Games come from the Steam Games Dataset on Kaggle; each one is condensed into a "profile" (its store description plus tags and features, with acronyms like FPS and MMORPG expanded to full phrases so the language model actually sees the words) and embedded with a Sentence Transformer.

## Features

- Natural-language game search ranked by cosine similarity over a ChromaDB vector index
- `all-mpnet-base-v2` fine-tuned on synthetic tag- and title-derived queries with `MultipleNegativesRankingLoss`
- LIME attributions showing which words of the query or the game's profile drove a match
- Interactive PCA, t-SNE, and PaCMAP maps of the catalog with KMeans clusters, and live queries projected out-of-sample onto them
- Offline index build (embeddings, vector index, projections) so the app stays fast per request
- Multi-page Streamlit app with a pytest suite, Dockerized and deployed to Streamlit Community Cloud

## Implementation details

The pipeline splits into an offline build and a live app. A build script embeds every profile with a fine-tuned `all-mpnet-base-v2` model, writes them into a ChromaDB vector index (cosine similarity over an HNSW graph), and precomputes PCA, t-SNE, and PaCMAP projections of the catalog with KMeans cluster labels. The multi-page Streamlit app (Search, Explain, Visualize, Catalog) then only has to encode the user's query at request time. It runs in Docker (the index is baked in at image build) and is deployed on Streamlit Community Cloud, with the fine-tuned model published to the Hugging Face Hub as its fallback source.

### Fine-tuning without real search logs

Off the shelf, MPNet embeds polished store descriptions and terse user queries into rather different regions of space, and there is no dataset of real "what players typed → what they meant" pairs to fix that. So the training data is synthesized: for each game, random subsets of its tags and features are sampled, shuffled, and joined into short lowercase queries ("roguelike deckbuilder game"), in both acronym and expanded forms, alongside casing and punctuation variants of the title itself. The model is then fine-tuned on 10,000 of these query→profile pairs with `MultipleNegativesRankingLoss`, which treats every other profile in a batch as a negative, pulling a game's plausible queries toward its profile without any hand labeling.

### Explaining and mapping the matches

Similarity scores alone are opaque, so the Explain page wraps the embedding model in LIME: it perturbs the query text word by word, re-embeds each variant, and measures how the cosine similarity to the matched game moves, surfacing which words actually drove the match. The same attribution runs in the other direction over the game's profile. On the Visualize page, the catalog is shown as interactive Plotly scatter plots (3D for PCA, 2D for t-SNE and PaCMAP) colored by cluster, and because openTSNE and PaCMAP support out-of-sample projection from their saved fits, a live query can be dropped onto the precomputed map as a marker to see which neighborhood of game-space it lands in.
