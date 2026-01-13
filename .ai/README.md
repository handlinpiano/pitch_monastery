# Pitch Monastery

A pitch discrimination training app that applies machine learning principles to human auditory learning.

## Concept

Traditional perfect pitch training focuses on rote memorization of note names through repetitive exposure. Pitch Monastery takes a different approach inspired by how neural networks learn: through gradient-based refinement of discrimination thresholds.

Instead of asking "what note is this?" we ask "which tone is higher?" - training the fundamental perceptual machinery rather than symbolic associations.

## Methodology

### Neural Network Parallel

| Neural Network | Human Training |
|----------------|----------------|
| Backpropagation | Immediate feedback on errors |
| Learning rate decay | Decreasing interval sizes as accuracy improves |
| Batch training | Session-based practice with varied examples |
| Loss function | Discrimination threshold (cents) |
| Convergence | Consistent accuracy at target threshold |

### Training Progression

1. **Coarse Discrimination** - Large intervals (semitones, whole tones)
2. **Fine Discrimination** - Quarter tones, eighth tones
3. **Micro Discrimination** - Sub-cent differences
4. **Absolute Reference** - Anchoring to specific frequencies (A440)
5. **Generalization** - Transfer across timbres, octaves, and contexts

### Key Principles

- **Discrimination before identification**: Train the ear to detect differences before naming them
- **Adaptive difficulty**: Interval size adjusts based on performance (like learning rate)
- **Spaced repetition**: Optimal review scheduling for long-term retention
- **Multi-timbre training**: Prevent overfitting to specific sounds
- **Reference anchoring**: Build absolute pitch from relative discrimination

## Target Outcomes

- Discriminate pitches within 5 cents accuracy
- Identify notes without external reference
- Maintain pitch memory across sessions
- Generalize across instruments and timbres

## Tech Stack

- Vite + Vanilla JS
- Tone.js for precise audio synthesis
- WebMidi for hardware input
- PWA for offline practice sessions
