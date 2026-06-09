---
title: love2d for sound synthesis is actually quite fun
date: 2026-06-09
---

with the release of games such as [Balatro](https://en.wikipedia.org/wiki/Balatro), love2d once again proved its capabilities and gained some attraction. previously, i had come across people who looked down on the framework, calling it a toy and stuff. games like this and the community never fails to deliver though. still, i think there is an important area of use most people don't realize love2d is pretty convenient to use for, and that is *sound synthesis*.

the main approach to create sound with code in love2d is building up the samples, and to be able to actually play those, utilizing a queueable source with `love.audio.newQueueableSource()`.

## a basic example

in our `main.lua` let's define a source at the top of the file and create and assign a queueable source at load. to do this we should also define a sample rate (which is usually 44.1kHz or 48kHz), the bit-depth and if it is to be mono or stereo:

```lua
local source
local sample_rate = 44100 -- this is 44.1kHz
local bit_depth = 16
local channels = 1 -- for mono, 2 for stereo

function love.load()
    source = love.audio.newQueueableSource(sample_rate, bit_depth, channels)
end
```

alright. now we have a `source` that's ready to be populated with samples. in order to do so, we need a buffer created with `love.sound.newSoundData()`. we also need to choose a sensible size for the buffer to prevent underruns or taking too much memory. in this example this size will be 1024 samples.

```lua
local source, buffer
local sample_rate = 44100
local buffer_size = 1024 -- samples
local bit_depth = 16
local channels = 1

function love.load()
    source = love.audio.newQueueableSource(sample_rate, bit_depth, channels)
    buffer = love.sound.newSoundData(buffer_size, sample_rate, bit_depth, channels)
end
```

the main loop of the program will consist of filling the buffer with samples, queueing the source with the buffer, and playing the source. in this example, we will play a square wave. we need to define the variables below to keep track of the phase and the frequency:

```lua
local frequency = 440 -- A4
local phase = 0.0 -- this will range between 0.0 and 1.0 to determine the wave shape
```

in `love.update()` we'll use `source:getFreeBufferCount()` to fill the source's buffer.

```lua
function love.update(dt)
    while source:getFreeBufferCount() > 0 do -- runs until the source is fully queued
        for i = 0, buffer_size - 1 do -- SoundData samples are 0-indexed
            -- to generate a square wave at full amplitude
            -- we will set the sample to 1 up until phase = 0.5
            -- and set it to -1 after that to 1.0
            -- therefore half of the time we have 1 and the other half is -1
            local sample
            if phase < 0.5 then sample = 1
            else sample = -1 end
            buffer:setSample(i, 1, sample)

            -- now we need to update the phase according to
            -- delta_f = frequency / sample_rate
            phase = phase + frequency / sample_rate
            -- and we need to clamp it to 0.0-1.0 range
            if phase >= 1.0 then phase = phase - 1.0 end
        end
        -- we finally have the buffer filled, so we queue it
        source:queue(buffer)
    end

    -- we need to constantly call source:play()
    -- to make sure it doesn't stop if we underrun
    source:play()
end
```

putting it all together, it plays a nice crisp square wave at full amplitude:

```lua
local source, buffer
local sample_rate = 44100
local buffer_size = 1024
local bit_depth = 16
local channels = 1

local frequency = 440
local phase = 0.0

function love.load()
    source = love.audio.newQueueableSource(sample_rate, bit_depth, channels)
    buffer = love.sound.newSoundData(buffer_size, sample_rate, bit_depth, channels)
end

function love.update()
    while source:getFreeBufferCount() > 0 do
        for i = 0, buffer_size - 1 do
            local sample
            if phase < 0.5 then sample = 1
            else sample = -1 end
            buffer:setSample(i, 1, sample)

            phase = phase + frequency / sample_rate
            if phase >= 1.0 then phase = phase - 1.0 end
        end
        source:queue(buffer)
    end
    source:play()
end
```

although this is not very exciting, it's definitely a nice place to start. being able to calculate the samples as you wish gives you a lot of control and opens up many possibilities! you can check out my sid chip emulator library [lovesid](https://github.com/mstfbil/lovesid) to see what's possible, and examine the code. it's basically this method but glorified.

## time for more sophisticated stuff

we are going to build some new features on top of the previous example to demonstrate some cool ideas.

### changing the duty cycle

the duty cycle is the percentage of period the wave spends in the high state. in our current square wave, this is 50%. by changing this number we can get different harmonics! it's trivial to adjust this value:

changing the `0.5` in line `if phase < 0.5 then sample = 1` is directly our duty cycle. if we change it to, say `0.2`, the wave is 1.0 20% of the time, and -1 80% of the time. this results in a sharper sound. you can even use a variable here and modulate it with time to get a more dynamic sound.

### arpeggiator

to get a nice arpeggiated chord, we will define a table of frequencies:

```lua
-- frequencies for a C major chord
local freq = {
    261.63, -- C4
    329.63, -- E4
    392.00  -- G4
}
```

we will also keep track of the current note we're playing, and a timer to change it periodically:

```lua
local arp_current_idx = 1
local arp_timer = 0 -- this is not in seconds, rather in samples!!!
local arp_delta = 0.1 * sample_rate -- change note every 0.1s

function love.update(dt)
    while source:getFreeBufferCount() > 0 do
        for i = 0, buffer_size - 1 do
            arp_timer = arp_timer + 1 -- increment for each sample
            if arp_timer >= arp_delta then
                arp_timer = 0 -- reset the timer if we hit the limit

                arp_current_idx = arp_current_idx + 1 -- increment the note
                if arp_current_idx > #freq then arp_current_idx = 1 end
            end
        end
    end
end
```

if we put it together:

```lua
local source, buffer
local sample_rate = 44100
local buffer_size = 1024
local bit_depth = 16
local channels = 1

local freq = {
    261.63, -- C4
    329.63, -- E4
    392.00  -- G4
}
local arp_current_idx = 1
local arp_timer = 0
local arp_delta = 0.1 * sample_rate
local phase = 0.0

function love.load()
    source = love.audio.newQueueableSource(sample_rate, bit_depth, channels)
    buffer = love.sound.newSoundData(buffer_size, sample_rate, bit_depth, channels)
end

function love.update(dt)
    while source:getFreeBufferCount() > 0 do
        for i = 0, buffer_size - 1 do
            arp_timer = arp_timer + 1
            if arp_timer >= arp_delta then
                arp_timer = 0

                arp_current_idx = arp_current_idx + 1
                if arp_current_idx > #freq then arp_current_idx = 1 end
            end

            local sample
            if phase < 0.5 then sample = 1
            else sample = -1 end
            buffer:setSample(i, 1, sample)

            phase = phase + freq[arp_current_idx] / sample_rate
            if phase >= 1.0 then phase = phase - 1.0 end
        end
        source:queue(buffer)
    end
    source:play()
end
```

## so what

these examples show only a small portion of what you can achieve with love2d in terms of synthesis. i'll probably write a new post sometime about more advanced approaches and stuff, but in the meantime, go wild. try to make a synth that takes in MIDI input, create an effect chain with reverb and distortion, try to make a visualizer that reacts to drums... it's only limited by your imagination.
