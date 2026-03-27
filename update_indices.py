import os
import re

MODELS_DIR = "server/src/models/"

for filename in os.listdir(MODELS_DIR):
    if not filename.endswith(".model.ts") and not filename.endswith("User.model.ts") and not filename.endswith("Course.model.ts") and not filename.endswith("Resource.model.ts") and not filename.endswith("Purchase.model.ts") and not filename.endswith("BlogPost.model.ts") and not filename.endswith("Subscription.model.ts"):
        pass

    # Actually, we can just process all models
    if not filename.endswith(".ts"):
        continue

    filepath = os.path.join(MODELS_DIR, filename)
    with open(filepath, "r") as f:
        content = f.read()

    # Find all properties with @Index
    # Example:
    #   @Index
    #   @Column({ ... })
    #   stripeCustomerId?: string;

    # We should parse manually or with regex to find indexes.
    pass
