# EngFEST Front End Plan

This project contains a front-end game written in HTML, CSS, and JavaScript.
We're an aviation-focussed group. We're making a game where a plane branded by IAG drops freight—a box with a parachute—in to a field. The player controls the freight with left and right arrow keys, to safely land the freight in the field.

The field is just tarmac at the bottom of the screen, which is fixed.

The parachute is attached to the top of the freight box in the middle.
The IAG plane will fly off the screen after dropping the freight.
A new IAG Plane will spawn with a new randomly selected size of freight.
When freight lands, a new plane is spawned with more freight

Competiting airlines (Triangle, Together) have planes that fly across the screen, entering from both sides of the screen who are trying to steal the freight. If a plane flies in to the parachute sprite, then it is stolen. If a plane flies in to the freight itself, then it's game over.
The competitor airline jets appear on the screen at random heights.

The freight comes in three different sizes—small (£100), medium (£200), large (£400)—with larger freight scoring more cash.

The objective is to maximise shareholder value. You start the game with £1000.

## Opening screen

Give an succinct overview at the start of the game.

## Appearances

When rendering the freight, you should use the images in the assets/images folder. Purple is large, green is medium, yellow is small.

## Physics

As you collect more freight, and increase your score, the freight starts falling faster and faster, and more competitor planes start flying in.

When a competitor plane collides with the parachute, the freight explodes in a puff of smoke. When the freight explodes, you lose double the value of the freight.

## Win conditions

When a freight lands on the field, you earn a certain amount of cash based on the size of the container.

The game continues until a competitor plane collides with your freight.

As the game continues, more competitor planes appear on screen at the same time, and start flying faster.

## Lose conditions

You lose when you run out of money. The game must keep track of your highest score, and how many of each cargo you landed.