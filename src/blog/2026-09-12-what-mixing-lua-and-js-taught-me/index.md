---
title: what mixing lua and js taught me
date: 2026-09-12
---

_it's quite late to write this post, but it's also tough to find time for it. enjoy the read._

recently, i participated in [GMTK Game Jam 2026](https://itch.io/jam/gmtk-jam-2026). the theme was **countdown**. i brainstormed for the first few hours, but couldn't conclude with an idea i liked. then out of desperation, i continued to look out for inspiration, when i stumbled upon this pic by Pawel Czerwinski. ![pendulum clock](pawel-czerwinski-Cb1bLUz2oio-unsplash.jpg) this gave me a good idea: making a game where the player nudges the pendulum in a way to slow down the countdown.

knowing that jams are great opportunities to try out new things (especially to see if these things work in a rush), i set myself some goals. the foremost one being trying to write the game in [yuescript](https://yuescript.org/). beforehand i prepared a template with a nice makefile to transpile the source from `.yue` to `.lua`. i like yuescript syntax but i wanted to see if it has any benefits over lua with regard to boilerplate and ease of use, and i found out that it definitely has for me. it's much more enjoyable to build something using yuescript as opposed to plain lua. i'm not sure how much faster it allowed me to build, but it definitely simplified and streamlined my flow.

anyway, as i built upon that idea with the clock, i settled on another objective as well: building a leaderboard. since the game's objective would be to keep the clock running for the longest time, a leaderboard in the main menu to see how others hold up, would be the missing piece to make it competitive. i built a small rest api on my vps to accept and provide leaderboard entries. i thought the backend would be the more difficult part, mainly because i'm not all experienced with building an api, but it proved to be the opposite.

since the jam was hosted on [itch.io](https://itch.io/), a web export was the way to go to let more people play the game. i used [Davidobot's love.js](https://github.com/Davidobot/love.js) to export to web. this posed some problems to say the least...

first and foremost, LuaSocket does not work on love.js exports. so that left me with one option to do HTTP requests, interfacing with the javascript engine of the browser from the lua side. well, _thankfully_ somebody had already made a library for this: [Love.js-Api-Player by MrcSnm](https://github.com/MrcSnm/Love.js-Api-Player). i intergrared it into the codebase but started having issues right there. the game would crash for no apparent reason. it took me some time to figure out exactly what was wrong: that library was using local storage to send the request results back to lua and for some reason the file was never getting written in the first place. so i came up with a _temporary_ fix that writes a dummy file when the game first loads, and the subsequent writes started working.

until it didn't...

see, the thing is, it was a _temporary_ bandaid, so i removed that line after a while, and seeing that the game still runs, i didn't put it back. well, it actually doesn't run, it needs that line. why did it not error though? because the dummy file was already there from the previous tests... i realized that was the case far too late, far after the submission window closed, and the game now would not run on any device that it hadn't run on before. practically everyone. i realized after i had people complaining about it and i reset all the site data.

interfacing with another layer or language is always a bit fragile, but i never really realized it could be this disastrous (to my competition at least). what i learned is to test, test, test, and when you're tired of testing, test some more. test your code. sure i could blame the interface library but the only reason i found out about the problem just when it was too late is that i didn't test enough edge cases.

to conclude, i figure i'll keep trying out yuescript (which would be the main topic of this post if i didn't fumble, but i'll write a dedicated one about it later too), but i'll definitely be more careful with testing.

if you will, you can go play [The Passing of Midnight](https://voltie-dev.itch.io/the-passing-of-midnight) on itch.io, but there's no leaderboard.
