import dramatiq


@dramatiq.actor
def sync_realms():
    print("sync_realms placeholder")


@dramatiq.actor
def sync_guilds():
    print("sync_guilds placeholder")


@dramatiq.actor
def recompute_rankings():
    print("recompute_rankings placeholder")


@dramatiq.actor
def generate_snapshots():
    print("generate_snapshots placeholder")
