
/* 
 
    Main Variables
    
    More Inside the Code
 
 */

// The Minimal XP a Monster must give to be target
var MIN_XP_OF_MONSTER = 800

// The Maximal Level your Items are beeing upgraded
var MAX_ITEM_LEVEL = 6

// The Json Information to show -- Development
var SHOW_INFORMATION = character

// The Number of Milliseconds for the Main Loop
var LOOP_SPEED = 250

/* 

    Begin of Functions 

*/

/* Main Functions */

// This Function is called on each Loop
function Main() {
    // Don't do anything while Moving
    if (character.moving) { return; }

    // Get target from Server
    var target = get_targeted_monster();

    // Act
    OneLoop(target);

    return;
}

// Action And Order the Character does each round
function OneLoop(target) {

    DrinkPotion()

    Loot()

    Attack(target)

    Move(target)

    CheckTarget(target)

    Update()

    Refill()

    return;

}

/* Support Functions */

// Min HP to drink Potion
var minhp_potion = 500
// Min MP to drink Potion
var minmp_potion = 500

// Drink a HP or MP Potion
function DrinkPotion() {
    if (hpLow()) {
        parent.use('hp')
    }

    if (mpLow()) {
        parent.use('mp');
    }

    return;
}
// Defines When to drink Hp
function hpLow() {
    if(character.hp < minhp_potion) {
        return true;
    }

    return false;
}
// Defines when to drink Mp
function mpLow() {
    if (character.mp < minmp_potion) {
        return true;
    }

    return false;
}

/* Loot Functions */

// Loot the chests
function Loot() {
    loot();
}


/* Attack Functions */

// Attack the Target
function Attack(target) {
    if (!target) return;

    if (!in_attack_range(target)) return;

    if ( target.hp && !target.dead ) {
        attack(target)
    }

    return;
}

/* Movement Functions */

// Move in X Direction
var movementspeed_x = 1
// Move in Y Direction
var movementspeed_y = 2

// Move towards Target If possible
function Move(target) {

    if (!target) {

        if (attack_target_off!=null){
            // Go to Friend
            MoveTo(attack_target_off)
            return;
        }
        // Just Move Around
        MoveAround()
        return;
    }

    if(!in_attack_range(target)) {
        // Get Closer to it
        MoveTowards(target)
        return;
    }

    return;
}

// Move to Specific Player
function MoveTo(player) {
    set_message("Go to " + player.name)

    move(
        character.real_x+(player.real_x-character.real_x-1),
        character.real_y+(player.real_y-character.real_y-1)
    );

    return;
}

// Move to a Monster
function MoveTowards(monster) {
    game_log("Move half the Distance to monster")

    // Half the Distance? Should be configurable...
    move(
        character.real_x+(target.real_x-character.real_x)/2,
        character.real_y+(target.real_y-character.real_y)/2
    );

    return;
}

// Move without target
function MoveAround() {
    set_message("No Monsters, bored");
    // Move according to speed
    move(
        character.real_x + movementspeed_x,
        character.real_y + movementspeed_y
    );

    return;
}

/* Aiming Functions */

// Name of the player to get target from
var attack_target_off = null

// Max Atk for Monster
var monster_maxatk = 200
// Min XP for Monster
var monster_minxp = MIN_XP_OF_MONSTER
// Name of the Monster
var monster_name = null
// Get Monster which is 'free'
var monster_notarget = true


// Get New Target if needed
function CheckTarget(target) {
    if (!target) {

        target = GetTargetOff(attack_target_off)

        if (!target) {
            // Get New Monster Target
            target = GetNearestMonster();
        }

        if (target) {
            game_log("Set Target to " + target.mtype)
            change_target(target)
            return;
        }
    }

    return;
}

// Get someelses Target
function GetTargetOff(playername) {
    // Check
    if (!playername) return null;
    // Check out the Player
    player = get_player(playername);
    // Check out his target
    target = get_target_of(player);

    return target;
}

// Get Nearest Monster
function GetNearestMonster() {

    target=get_nearest_monster({
                min_xp:monster_minxp,
                max_att:monster_maxatk,
                target:monster_name,
                no_target:monster_notarget
            });

    return target;
}


/* Update Functions */

// The Max Level to wich Items should be updated
var MaxItemLevel = MAX_ITEM_LEVEL
// Minimal Money you want to keep
var MoneySwitch = 100000

function Update() {

    // Don't Update if no Money
    if (character.gold <= MoneySwitch) {
        set_message("Updates Paused")
        return
    }

    // Loop through Equipped Items
    for (slot in character.slots) {
        // Get the Item
        item = character.slots[slot]

        // Get Name & Level
        var name = item["name"]
        var level = item["level"]

        // Excluding it for the moment -- Needs a different Scroll
        if (name == "hpamulet") {
            continue;
        }

        // Buy the Item if needed
        BuyItem(name)
        // Update the Item if possible
        UpdateItem(name)
        // Equip the Item if needed
        EquipItem(name, level)
    }

}

// Updates the Item
function UpdateItem(ItemName) {
    // Get Item
    item = FindItem(ItemName)

    if (!item) {
        game_log("Error: Item not found")
        return
    }

    // Max Level?
    if(item["level"] >= MaxItemLevel) {
        return
    }

    // Get the Scroll
    scroll = FindItem(ScrollName)

    // No Scrolls - No Updates
    if (!scroll) {
        return
    }

    // Finally -- Do it!
    upgrade(ItemIndex(ItemName), ItemIndex(ScrollName))

    return;
}

// Get the Item according to ItemName
function FindItem(ItemName) {
    // Finds First Item of the Name
    for (i=0; i<character.items.length; i++) {
        // Check out the Item
        item = character.items[i]
        // Does it fit?
        if (item && item["name"] == ItemName) {
            return item;
        }

    }

    return null;
}

// Get the Index of the Item -- Desperately looking for a better way
function ItemIndex(ItemName) {
    // Finds First Index of the Name
    for (i=0; i<character.items.length; i++) {
        // Check out the Item
        item = character.items[i]
        // Does it fit?
        if (item && item["name"] == ItemName) {
            return i;
        }

    }

    return null;
}

// Buy the specified Item
function BuyItem(ItemName) {
    // Check out Item
    item = FindItem(ItemName)

    // Only buy if you don't have it yet
    if (!item) { 
        game_log("Buying + '" + ItemName + "'")
        // Buy only One
        buy(ItemName, 1)
        return;
    }

    return;
}

// Equip the Item if its better than SlotLevel
function EquipItem(ItemName, SlotLevel) {
    // Check out the item
    item = FindItem(ItemName)

    // Does it exists?
    if (!item) return;

    // Is it better?
    if (item.level > SlotLevel) {
        game_log("Equipping " + item["name"])
        equip(ItemIndex(ItemName))
        return;
    }

    return;
}

/* Refill Functions */

// Name of the HP Potion
var HpName = "hpot0"
// Amount of Potions to buy
var HpAmount = 100
// When to buy Potion
var HpSafety = 100

// The Name of the Scroll to buy
var ScrollName = "scroll0"
// The Amount of Scrolls to buy
var ScrollAmount = 10
// When to buy Scroll
var ScrollSafety = 10

// Refill your Stock
function Refill() {
    // Buy HP Potions
    RefillHealthPotions()
    // Buy Scrolls
    RefillScrolls()
}

// Buy HP Potions according to Parameters
function RefillHealthPotions () {
    potion = FindItem(HpName)

    if (!potion || potion["q"] <= HpSafety) {
        buy(HpName, HpAmount)
    }

    return;
}

// Buy Scrolls
function RefillScrolls() {
    scroll = FindItem(ScrollName)

    if (!scroll || scroll["q"] <= ScrollSafety) {
        buy(ScrollName, ScrollAmount)
    }

    return
}

/* development Functions */

// Show a Json of the Spefied Paramter
function Show(item) {
    if (item) {
        show_json(item);
    }

    return;
}

/*

    End of Functions

*/

/* Starter Function */
setInterval( Main, LOOP_SPEED );

/* Show it Once */
Show(SHOW_INFORMATION)

