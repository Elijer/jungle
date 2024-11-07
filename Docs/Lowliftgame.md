# Jungle lowliftt

# Brainstorm

1. everyone is rock paper scissors, but you need to time it correctly to “get” someone
2. Every person you get gives you a full day of offline immunity? but there is a max of 4 days?
3. there are powerups
4. you can only be online 
5. give yourself a name (with blacklisting)
6. everyone’s visibility shape is a bit different


# Plan
- rock paper scissors but “Hacker, Love, 100”
- 👾💛💯
- Your score goes up 1 every second for how many active players there are
- You see a timer for when your sign changes, sign changes happen every 5 seconds
-  👾 > 💯 > 💛 > 👾
- your sign changes deterministically
- and you can bury your “loot”
- to reveal loot, you need to press three buttons in fast succession to dig it up
- Leaderboard

# Plan Reflection

This plan is a great idea, and I like the spirit of it, but it doesn't quite work.
If each player is assigned rock, paper, scissor, and these signs change deterministically, then the relationships between players will always sort of stay the same.
Maybe this can be rivalled by the fact that a player who loses will be switched ot the next sign type, but I'm not sure if this is enough.

On the other hand, I could assign players randomly at intervals.
I like this because you'd still have to do the relationship mapping in your head.

I could also just make the signs cycle deterministically, but their order of attack would flip flop every interval. So normally
💛 > 👾 > 💯, but the flip flop makes 💛 < 👾 < 💯
So all players that were attacking you would now be defending against you and vice versa, but you'd also have a different sign so it would be kind of hard to figure this out.

I could also just flip flop and never cycle signs. So if you're a heart, you're a heart. But sometimes the 👾 attacks you, and sometimes the 💯 attacks you.
I think this is a pretty good place to start.
So I have a singleton that starts at 0, increments, and after 2 goes back to 0. This generator is used to assign players.
When a player dies, they get assigned a new sign by the generator.
Let's say when a player goes offline, you CAN'T get got??

# Noticed
## Loading Uneeded / Unwanted Players
- That although I have this mosaic Line of Sight, the other players who join still show up outside of it
- it seems that player updates are still going to those who don't need them
- and I want to change this