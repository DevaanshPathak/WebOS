# How LLMs Actually Work

**Published:** Monday, June 1, 2026

**Reading time:** 26 minutes

**Topics:** Machine Learning, Transformers, LLMs, Neural Networks, AI

Modern large language models feel mysterious from the outside, but their core architecture is surprisingly understandable once you break it down.

Most LLMs today are built by stacking the same kind of component again and again: the **transformer block**. If you understand what happens inside a transformer, you understand most of what happens inside modern LLMs.

This post walks through the major pieces of a transformer-based language model without getting buried in math. The math is worth learning eventually, but you do not need it to build a strong mental model of how these systems work.

By the end, you should be able to look at many LLM papers, model cards, or architecture diagrams and understand what each section is referring to.

We will cover:

1. **Tokenization** — how text becomes numbers
2. **Embeddings** — how those numbers become meaningful vectors
3. **Positional encoding** — how the model understands token order
4. **Attention** — how tokens exchange information
5. **Multi-head attention** — how the model tracks many relationships at once
6. **Feed-forward networks** — where much of the model’s stored knowledge lives
7. **Residual streams and normalization** — what makes deep transformers trainable
8. **Next-token prediction** — what the model actually outputs
9. **Architecture vs. trained weights** — what modern LLMs share, and what makes them different

Throughout the post, I’ll include short explainers for the important terms so the ideas stay easy to follow.

---

## 1. Tokenization

LLMs do not read text directly.

They read numbers.

Before a model can process a sentence, that sentence has to be converted into a sequence of integer IDs. This conversion step is called **tokenization**.

A tokenizer takes raw text and maps it into a list of numbers. Each number points to one entry in a fixed vocabulary.

For example, a prompt like:

```
How do LLMs work?
```

might become something like:

```
[2437, 656, 445, 9123, 30]
```

The exact numbers depend on the tokenizer.

> **Tiny explainer: token ID**
> 
> 
> A token ID is the integer representation of one vocabulary entry. The model works with the ID, not the written word itself.
> 

Tokens are not always whole words. In fact, they are usually **subword pieces**.

For example:

```
tokenization → token + ization
running      → run + ning
```

This is a practical compromise.

A vocabulary made of whole words would become enormous and would struggle with rare or new words. A vocabulary made only of characters would be tiny, but it would force the model to learn even basic word patterns from scratch. Subword tokenization sits in the middle: common pieces become individual tokens, while rare words can still be built out of smaller pieces.

> **Tiny explainer: vocabulary**
> 
> 
> The vocabulary is the tokenizer’s fixed list of pieces. Each piece has an ID, and the model can only directly receive IDs from that list.
> 

This also explains some weird LLM behavior.

A classic example is asking a model how many **r** letters are in the word “strawberry.” Models have often struggled with questions like this because they are not naturally seeing the word as individual letters. They are seeing token IDs that may represent chunks of the word.

That does not mean the model is “bad at counting” in a human way. It means the model’s input format is different from ours.

![Tokenization turns text into token IDs](https://chatgpt.com/c/images/tokenization.png)

Different model families use different tokenization systems. GPT-style models use variants of **Byte Pair Encoding**, while many LLaMA-style models use **SentencePiece**. The choice affects efficiency, multilingual performance, and how many tokens a piece of text becomes.

But the basic idea stays the same:

```
Text in → token IDs out
```

Once the prompt has become a list of integers, the next step is to turn those integers into something the model can actually reason over.

---

## 2. Embeddings

A token ID by itself has no meaning.

The number `1024` is just an index. It does not contain the meaning of a word, phrase, or symbol.

The model gives meaning to token IDs using a large table called the **embedding matrix**.

This table has one row for every token in the vocabulary. Each row contains a long list of learned numbers. That list is called a **vector**.

> **Tiny explainer: vector**
> 
> 
> A vector is a list of numbers. In a transformer, each token becomes a vector so the model can do mathematical operations on it.
> 

If the tokenizer outputs the ID `1024`, the model looks up row `1024` in the embedding matrix. The row it finds becomes the token’s embedding.

> **Tiny explainer: embedding matrix**
> 
> 
> The embedding matrix is a lookup table. Token ID in, learned vector out.
> 

The length of each embedding vector is called the model’s **hidden size**. In many 7B-class models, this might be 4,096 numbers per token. Larger models often use wider vectors.

The important part is that these numbers are not manually assigned. They are learned during training.

Over time, the model learns to place related tokens near each other in this high-dimensional space. Tokens like “king” and “queen” end up closer together than unrelated tokens. “Paris” and “France” also end up related in the embedding space.

This structure is not hard-coded. It emerges because arranging meanings this way helps the model predict text more accurately.

A famous example from embedding research is:

```
king - man + woman ≈ queen
```

This does not work perfectly in every model or every context, but it shows the core idea: embedding spaces can contain meaningful semantic structure.

![Embedding space analogy with semantic relationships](https://chatgpt.com/c/images/embedding-space.png)

At this point, every token has been replaced by a vector. But there is still a major problem.

The embedding for a token is the same no matter where that token appears.

The vector for “dog” is the same whether “dog” appears at the beginning of a sentence or near the end. But word order matters. “Dog bites man” and “Man bites dog” mean very different things.

So the model needs a way to understand position.

That is where positional encoding comes in.

---

## 3. Positional Encoding

Self-attention does not naturally know the order of tokens.

If you only give the model token embeddings, it can see which tokens are present, but it does not automatically know which token came first, second, or third.

That is a problem, because order changes meaning.

```
The dog chased the cat.
The cat chased the dog.
```

Same words. Different meaning.

> **Tiny explainer: positional encoding**
> 
> 
> Positional encoding is how the model receives information about where each token appears in the sequence.
> 

The original transformer paper introduced a method based on sine and cosine waves. Each position had its own numerical pattern, and that pattern was added directly to the token embedding.

So the embedding for “dog” at position 1 became slightly different from the embedding for “dog” at position 5.

This worked well and had a useful property: sinusoidal patterns can generalize somewhat beyond the exact positions seen during training.

However, additive positional encodings also had limitations.

First, the token vector had to carry both meaning and position in the same space. That can become inefficient.

Second, learned absolute position embeddings do not always generalize cleanly. If a model was trained on sequences up to 2,048 tokens, it may not know what to do with position 5,000 unless special techniques are used.

Modern LLMs commonly use a different method called **Rotary Position Embeddings**, or **RoPE**.

Instead of adding a position vector to the token embedding, RoPE modifies the **Query** and **Key** vectors used during attention. It rotates them by an amount based on the token’s position.

A token near the beginning gets a small rotation. A token farther away gets a larger rotation. When two tokens are compared during attention, the difference in their rotations helps the model understand their relative distance.

> **Tiny explainer: RoPE**
> 
> 
> RoPE stands for Rotary Position Embeddings. It encodes position by rotating Query and Key vectors so relative distance becomes visible during attention.
> 

![Rotary position embeddings rotate vectors by position](https://chatgpt.com/c/images/rope.png)

RoPE has several practical advantages:

- It naturally represents relative position.
- It does not add new learned parameters.
- It tends to work better for long-context models than simple absolute position schemes.

Many open-weight model families use RoPE, including LLaMA, Mistral, Gemma, and Qwen-style architectures.

Even with good positional encoding, long-context models still have weaknesses.

One well-known issue is the **lost in the middle** problem. Models often use information at the beginning and end of a long prompt more reliably than information buried in the middle.

This is why prompt-writing advice like “put the most important context first” or “repeat key instructions near the end” often helps.

Now the model has token meaning and token position.

The next question is:

How do tokens actually communicate with each other?

---

## 4. Attention

Attention is the mechanism that gives transformers their power.

Inside each transformer layer, attention lets every token look at the other tokens it is allowed to see and decide which ones matter.

For each token, the model creates three vectors:

- **Query**
- **Key**
- **Value**

These are usually shortened to **Q**, **K**, and **V**.

> **Tiny explainer: Q, K, V**
> 
> 
> Query means “what am I looking for?”
> 
> Key means “what do I offer?”
> 
> Value means “what information do I pass along if I am selected?”
> 

Each token plays all three roles at once.

The model learns separate transformations that turn the token’s current vector into its Query, Key, and Value vectors.

The attention process works like this:

1. A token’s Query is compared with other tokens’ Keys.
2. Each comparison produces a score.
3. The scores are converted into weights using softmax.
4. The weights are used to take a weighted average of the Value vectors.
5. The result becomes the token’s updated representation.

The comparison between Query and Key is usually done with a **dot product**.

> **Tiny explainer: dot product**
> 
> 
> A dot product measures how aligned two vectors are. Higher alignment means a stronger match.
> 

The raw match scores can be any values, so the model applies **softmax** to turn them into a distribution.

> **Tiny explainer: softmax**
> 
> 
> Softmax converts raw scores into weights that add up to 1. Larger scores become larger weights.
> 

Here is an intuitive example:

```
The cat that I saw yesterday was sleeping.
```

When the model processes the word “was,” it needs to understand what was sleeping.

The Query vector for “was” gets compared with the Key vectors for earlier tokens. The token “cat” is likely to receive a strong score because it is the subject. The token “yesterday” is less relevant for that relationship, so it receives a weaker score.

After softmax, “cat” gets a high attention weight, and “yesterday” gets a low one. The model then takes a weighted sum of the Value vectors, so the representation of “was” becomes strongly influenced by “cat.”

That is how a token can pull information from another token several positions away.

GPT-style language models use a special restriction called **causal masking**.

Because they generate text from left to right, a token is only allowed to attend to itself and earlier tokens. It cannot look into the future.

For example, the token at position 5 can attend to positions 1 through 5, but not positions 6, 7, or 8.

> **Tiny explainer: causal masking**
> 
> 
> Causal masking hides future tokens so a decoder-only language model cannot cheat while predicting the next token.
> 

![Attention heatmap showing causal masking and high attention to a subject token](https://chatgpt.com/c/images/causal-attention.png)

Attention is also connected to one of the clearest known mechanisms behind in-context learning: **induction heads**.

Researchers have found attention heads that notice patterns like:

```
A B ... A
```

This is one way models can pick up patterns from the prompt itself.

When the model sees `A` again, the induction head looks back to the earlier `A`, sees that `B` followed it, and helps predict `B` again.

> **Tiny explainer: induction head**
> 
> 
> An induction head is an attention head that notices repeated patterns and helps continue them.
> 

Attention is powerful, but it is expensive.

In full attention, every token compares itself with every token it is allowed to see. If the sequence gets twice as long, the attention work grows roughly four times larger. This is why long prompts are computationally expensive.

Many efficiency techniques, such as FlashAttention, sparse attention, and linear attention, are attempts to reduce this cost.

But a single attention operation only gives the model one view of token relationships.

Language has many relationships happening at once.

That is why transformers use multi-head attention.

---

## 5. Multi-Head Attention

A single attention head can learn one kind of relationship between tokens.

But language is full of overlapping relationships:

- Subjects connect to verbs.
- Pronouns connect to names.
- Articles connect to nouns.
- Sentences refer back to earlier sentences.
- Local word order matters.
- Long-range context matters too.

Multi-head attention lets the model track many of these relationships in parallel.

> **Tiny explainer: attention head**
> 
> 
> An attention head is one independent attention operation with its own learned projections.
> 

Each head has its own learned matrices for creating Q, K, and V vectors.

A common misunderstanding is that each head receives a fixed slice of the token vector. That is not quite right.

If a model has a hidden size of 4,096 and 32 attention heads, each head may work in a 128-dimensional space. But those 128 dimensions are not just a literal chunk of the original vector. They are a learned projection from the full 4,096-dimensional representation.

So each head sees a different learned view of the same token.

Each head runs attention independently. Then all the head outputs are concatenated and passed through another learned linear layer that mixes them back into one full-size vector.

![Multi-head attention combines specialized attention heads](https://chatgpt.com/c/images/multi-head-attention.png)

Different heads often become partially specialized.

The model is not explicitly told, “this head should track grammar” or “this head should track pronouns.” These roles emerge during training because they help the model predict text.

Researchers have found heads that appear to track:

- grammatical structure
- pronoun references
- repeated patterns
- positional relationships
- nearby phrases
- long-distance dependencies

A single layer might contain dozens of attention heads. A large model might have dozens or even hundreds of layers. Across the full model, there can be thousands of attention heads, each contributing a different learned view of the sequence.

However, attention heads create a memory cost during generation.

When a model generates text, it stores the old Key and Value vectors for previous tokens. This is called the **KV cache**.

> **Tiny explainer: KV cache**
> 
> 
> The KV cache stores previous Key and Value vectors so the model does not need to recompute the entire prompt every time it generates a new token.
> 

The KV cache is one of the main reasons long-context inference requires so much memory.

To reduce this cost, many modern decoder-only LLMs use **Grouped-Query Attention**, or **GQA**.

In standard multi-head attention, every query head has its own key and value heads. In GQA, multiple query heads share fewer key/value heads.

For example:

- LLaMA 2 70B uses 64 query heads but only 8 key/value heads.
- Mistral 7B uses 32 query heads and 8 key/value heads.

This keeps many query views while reducing KV-cache memory.

> **Tiny explainer: GQA**
> 
> 
> Grouped-Query Attention lets several query heads share fewer key/value heads, reducing memory cost during inference.
> 

Attention lets tokens exchange information.

But each transformer layer has another major component that is just as important: the feed-forward network.

---

## 6. Feed-Forward Networks

After attention mixes information between tokens, the model sends each token through a **feed-forward network**, often shortened to **FFN** or **MLP**.

Attention is about tokens talking to each other.

The feed-forward network is about each token doing more internal processing on its own.

The FFN is applied independently to every token vector. It does not mix information across tokens. That cross-token mixing has already happened in attention.

A typical feed-forward network does three things:

1. Expands the token vector to a larger size.
2. Applies a non-linear function.
3. Compresses the vector back to the original hidden size.

![Feed-forward network expands, transforms, and compresses each token vector](https://chatgpt.com/c/images/feed-forward-network.png)

The non-linear function in the middle is essential.

> **Tiny explainer: non-linearity**
> 
> 
> A non-linearity is a function that prevents the network from collapsing into one large linear transformation.
> 

Without a non-linearity, stacking multiple linear layers would not add much power. Two linear layers in a row are mathematically equivalent to one linear layer. A hundred linear layers without non-linearities would still collapse into one linear transformation.

The non-linearity lets the network represent much richer patterns.

The original transformer used **ReLU**. Later models often used **GELU**. Many modern models, including LLaMA and Mistral-style architectures, use **SwiGLU**.

The expand-transform-compress structure remains, but the activation function has evolved.

A very large share of a dense transformer’s parameters live in the feed-forward networks, not in attention.

This matters because the FFN is believed to store much of the model’s factual and semantic structure.

Some neurons inside feed-forward layers appear to activate strongly for specific concepts. One neuron may respond to Eiffel Tower-related text. Another may respond to programming languages. Another may respond to grammatical patterns.

A model’s knowledge is not stored like a database row, but many facts and associations are represented across FFN weights and activations.

This has led to research on model editing. Methods such as ROME attempt to change specific factual associations inside a trained model by editing targeted feed-forward weights, without retraining the whole model.

For example, a model might be edited so that an association like:

```
The Eiffel Tower is in Paris.
```

is changed toward:

```
The Eiffel Tower is in Rome.
```

The point is not that this is always desirable. The point is that some factual associations can be traced to specific internal structures well enough to modify them.

Some frontier models replace dense feed-forward networks with **Mixture of Experts**, or **MoE**.

In an MoE model, each layer contains multiple feed-forward networks called experts. A small router decides which experts should process each token.

> **Tiny explainer: MoE**
> 
> 
> Mixture of Experts means the model has several feed-forward networks and routes each token through only a few of them.
> 

This allows the model to have many more total parameters without using all of them for every token.

For example, Mixtral 8x7B has 8 experts per layer, but only 2 are active for each token. It has 46.7 billion total parameters, but uses about 12.9 billion parameters per token.

This is one way modern models scale capacity without making inference cost grow in direct proportion to total parameter count.

Attention and feed-forward networks do the main computation.

But to stack many layers of them, the model needs two stabilizing tricks: residual connections and normalization.

---

## 7. Residual Streams and Layer Normalization

Transformers are deep.

A model may have dozens or even hundreds of layers. If each layer completely replaced the previous representation, training would become unstable and information could easily be lost.

Instead, transformers use **residual connections**.

After attention runs, its output is added back to the token’s existing vector. After the feed-forward network runs, its output is also added back.

The model does not simply replace the old vector.

It adds to it.

> **Tiny explainer: residual connection**
> 
> 
> A residual connection adds a block’s output back to its input, giving information and gradients a shortcut through the network.
> 

Across many layers, these additions create what researchers call the **residual stream**.

The residual stream is like a running workspace. Attention heads and feed-forward networks read from it, compute updates, and write their results back into it.

![Residual stream accumulates attention and feed-forward outputs](https://chatgpt.com/c/images/residual-stream.png)

This makes the model additive. Each layer contributes changes instead of completely overwriting everything that came before.

Residual connections originally became famous through ResNet in computer vision. They helped solve a major training problem: very deep networks were difficult to optimize because gradients could vanish or explode as they passed through many layers.

Residual shortcuts made it easier for learning signals to flow backward through the model.

Transformers inherited this idea.

In interpretability research, the residual stream is now one of the most important objects to study. Attention heads, feed-forward layers, and the final output step all interact with it.

The second stabilizing trick is **layer normalization**.

When many layers keep adding numbers into the residual stream, values can grow too large or shrink too small. Either case makes training difficult.

Layer normalization keeps each token vector in a stable numerical range.

> **Tiny explainer: layer normalization**
> 
> 
> Layer normalization rescales a token vector so the numbers stay stable during training.
> 

The original transformer used **post-norm**, where normalization happened after each sub-block.

Many modern transformers use **pre-norm**, where normalization happens before attention and before the feed-forward network. Pre-norm generally makes very deep transformers easier to train.

Many modern open models also use a simpler normalization method called **RMSNorm**.

> **Tiny explainer: RMSNorm**
> 
> 
> RMSNorm rescales the size of a vector without subtracting its mean first, making it simpler and cheaper than standard layer normalization.
> 

Standard layer normalization shifts and rescales the vector. RMSNorm mainly keeps the rescaling part. In practice, that often provides most of the benefit at a lower compute cost.

These details may sound unglamorous, but they are crucial.

Without residual connections, deep transformers become much harder to train. Without normalization, the residual stream can become numerically unstable.

Together, they make large transformer stacks possible.

Now we can look at the final stage: how the model actually produces text.

---

## 8. Next-Token Prediction

After the input passes through all transformer layers, the model has a final vector for every token in the sequence.

During generation, the model mainly cares about the vector for the last token.

That final vector is converted into one score for every possible next token in the vocabulary.

If the vocabulary has 100,000 tokens, the model outputs 100,000 scores.

These raw scores are called **logits**.

> **Tiny explainer: logits**
> 
> 
> Logits are raw scores for each possible next token. They become probabilities only after softmax is applied.
> 

The model then applies softmax to turn the logits into a probability distribution.

For example, after the phrase:

```
The capital of France is
```

the model might assign high probability to:

```
Paris
```

and lower probability to many other tokens.

The model does not always choose the single highest-probability token. The decoding settings control how deterministic or creative the output feels.

Important decoding controls include:

- **Temperature**
- **Top-k sampling**
- **Top-p sampling**

> **Tiny explainer: temperature**
> 
> 
> Temperature controls randomness during sampling. Lower temperature makes outputs more conservative. Higher temperature makes outputs more varied.
> 

Once the model chooses a token, that token is appended to the input. The model then predicts the next token after that.

This loop repeats:

```
Predict token → append token → predict next token → append token → ...
```

A full paragraph is generated one token at a time.

During this process, the model usually reuses the KV cache so it does not need to recompute the entire prompt every time.

Base LLMs are trained primarily with this objective:

```
Given previous tokens, predict the next token.
```

That is the core training signal.

The base model is not directly trained to be truthful, conversational, safe, or helpful. It is trained to predict text. Later post-training stages, such as instruction tuning and preference optimization, shape the base model into a more useful assistant.

One major inference optimization is **speculative decoding**.

> **Tiny explainer: speculative decoding**
> 
> 
> Speculative decoding uses a smaller draft model to propose several tokens, then lets the larger model verify them in parallel.
> 

The smaller model guesses ahead. The larger model checks those guesses. If the guesses match what the larger model would likely produce, they are accepted. If not, the system falls back to the larger model’s output.

When implemented correctly, speculative decoding can speed up generation while preserving the large model’s output distribution.

Next-token prediction is conceptually simple, but it is the loop that makes LLMs work.

Now that we have covered the pipeline, we can separate two ideas that are often mixed together: architecture and trained weights.

---

## 9. Architecture vs. Trained Weights

So far, we have covered the core architecture:

- tokenization
- embeddings
- positional encoding
- attention
- multi-head attention
- feed-forward networks
- residual streams
- normalization
- next-token prediction

Most modern LLMs share this broad transformer-family structure.

So what makes GPT, Claude, Gemini, LLaMA, Mistral, Qwen, and other models different?

At a high level, the differences come from three places.

### 1. The trained weights

The weights are the learned numbers inside the model.

> **Tiny explainer: weights**
> 
> 
> Weights are the learned parameters of the model. Training changes these numbers until the model becomes good at predicting text.
> 

Two models can have similar architectures but very different weights because they were trained on different data, at different scales, with different training recipes.

The weights determine much of what the model knows and how it behaves.

### 2. The configuration

Models also differ in their architectural settings, such as:

- number of layers
- hidden size
- vocabulary size
- attention head count
- context length
- parameter count
- dense vs. MoE structure
- GQA vs. standard multi-head attention

These choices affect performance, speed, memory use, and training cost.

### 3. The post-training

After base training, many models go through additional stages to make them better at following instructions and interacting with users.

This can include:

- instruction tuning
- supervised fine-tuning
- reinforcement learning from human feedback
- preference optimization
- safety training
- tool-use training

This is why a base model and a chat model can feel very different even if they share the same underlying architecture.

Between roughly 2023 and 2025, many modern transformer models converged on a common set of design choices:

- pre-norm transformer blocks
- RMSNorm
- RoPE
- SwiGLU
- Grouped-Query Attention
- Mixture of Experts in some larger models

These improvements were not invented all at once. They accumulated over several years of refinement on top of the original 2017 transformer design.

---

## 10. Where This Is Going

The transformer’s dominance is unusual in machine learning history.

For a long time, different domains used very different architectures. Computer vision had its own models. Language had another family. Audio had its own methods. Multimodal systems were even more specialized.

Transformers changed that.

Today, transformer-style models appear across:

- language
- images
- audio
- video
- robotics
- multimodal AI systems

The transformer absorbed a huge part of modern machine learning.

That does not mean it will dominate forever.

State-space models such as Mamba are serious alternatives, especially for very long sequences. Hybrid architectures are being explored. Mixture-of-experts has already changed what large-scale model architecture looks like.

But even if the exact architecture changes, the core problems remain similar.

Any strong sequence model needs some way to handle:

- discrete inputs
- meaningful representations
- order
- information sharing
- memory
- computation
- stable deep training
- output prediction

That is why the ideas in this post are durable.

Tokens, embeddings, positional encoding, attention, feed-forward networks, residual streams, normalization, and next-token prediction are not just isolated transformer details. They are solutions to the basic problems of sequence modeling.

If you understand these pieces, you can read many modern LLM papers, model cards, and architecture diagrams without feeling lost.

That was the goal.

Feedback is always welcome. If this topic interests you, feel free to reach out. I enjoy meeting people who are curious about how these systems actually work.