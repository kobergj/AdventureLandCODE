
/* Safety Parameters */
var minhp_potion = 500
var minmp_potion = 500

/* Buy Parameters */


/* Move Parameters */
var movementspeed_x = 1
var movementspeed_y = 2

/* Attack Parameters */
var attack_target_off = null

var monster_maxatk = 120
var monster_minxp = 100
var monster_name = null
var monster_notarget = true

/* Show Information */
// GameInfo: parent.G
// ItemInfo: character.items
var show = character

/* Starter Function */
setInterval( Main, 250 ); // All 250 ms

/* Show it Once */
Show(show)

/* END OF CODE */

/* Main Functions */

function Main() {
    if (character.moving) { return; }

    var target = get_targeted_monster();

    OneLoop(target);

    return;
}

function OneLoop(target) {
    Potion()

    Loot()

    Attack(target)

    Move(target)

    CheckTarget(target)

    Update()

    Refill()

    return;

}

/* Support Functions */

function Potion() {
    if (hpLow()) {
        parent.use('hp')

        if (character.items[0].q <= hp_potion_min) {
            buyHpPotions()
        }
    }
    if (mpLow()) {
        use_hp_or_mp();
    }

    return;
}

function hpLow() {
    if(character.hp < minhp_potion) {
        return true;
    }

    return false;
}

function buyHpPotions() {
    buy(hp_potion_name, hp_potion_amount)
}

function mpLow() {
    if (character.mp < minmp_potion) {
        return true;
    }

    return false;
}

function Loot() {
    loot();
}


/* Attack Functions */

function Attack(target) {
    if (!target) return;

    if (!in_attack_range(target)) return;

    // if(safeties && mssince(last_attack)<400) return;

    set_message("Attacking " + target.mtype)
    //game_log(parent.next_attack)

    if(target.type=="character") parent.player_attack.call(target);

    else parent.socket.emit("click",{type:"monster",id:target.server_id,button:"right"}); // parent.monster_attack.call(target);

    //last_attack=new Date();

    //attack(target);

    return;
}

/* Aiming Functions */

function CheckTarget(target) {
    if (!target) {

        if (attack_target_off!=null){
            // Get someones Target
            player = get_player(attack_target_off);
            target = get_target_of(player);
            return;
        } else {
            // Get New Monster Targer
            target=get_nearest_monster({
                min_xp:monster_minxp,
                max_att:monster_maxatk,
                target:monster_name,
                no_target:monster_notarget
            });
        };

        if (target) {
            game_log("Set Target to " + target.mtype)
            change_target(target)
            return;
        }
    }

    return;
}

/* Movement Functions */

function Move(target) {
    if (!target) {

        // Go to Friend
        if (attack_target_off!=null){
            set_message("Go to " + player.name)
            move(
                character.real_x+(player.real_x-character.real_x-1),
                character.real_y+(player.real_y-character.real_y-1)
            );
            return;
        }

        // Move according to speed
        set_message("No Monsters, bored");
            move(
                character.real_x + movementspeed_x,
                character.real_y + movementspeed_y
            );
        return;
    }

    if(!in_attack_range(target)) {
        game_log("Move half the Distance to monster")
        move(
            character.real_x+(target.real_x-character.real_x)/2,
            character.real_y+(target.real_y-character.real_y)/2
            );
        return;
    }

    return;
}

/* Update Functions */
var MaxItemLevel = 6

var MoneySwitch = 100000

function Update() {

    if (character.gold <= MoneySwitch) {
        set_message("Updates Paused")
        return
    }

    // Loop through Equipped Items
    for (slot in character.slots) {
        item = character.slots[slot]

        var name = item["name"]
        var level = item["level"]

            // Excluding it for the moment
        if (name == "hpamulet") {
            continue;
        }

        BuyItem(name)

        UpdateItem(name)

        EquipItem(name, level)
    }

}

function UpdateItem(ItemName) {
    item = FindItem(ItemName)

    if (!item) {
        game_log("Error: Item not found")
        return
    }

    if(item["level"] >= MaxItemLevel) {
        return
    }

    scroll = FindItem(ScrollName)

    if (!scroll) {
        return
    }

    upgrade(ItemIndex(ItemName), ItemIndex(ScrollName))
}

function FindItem(ItemName) {
    // Finds First Item of the Name
    var i
    for (i=0; i<character.items.length; i++) {
        item = character.items[i]

        if (item && item["name"] == ItemName) {
            // game_log("Returning " + i + " And " + item["name"])
            return item
        }

    }

    return null
}

function ItemIndex(ItemName) {
    // Finds First Index of the Name
    var i
    for (i=0; i<character.items.length; i++) {
        item = character.items[i]

        if (item && item["name"] == ItemName) {
            // game_log("Returning " + i + " And " + item["name"])
            return i
        }

    }

    return null
}

function BuyItem(ItemName) {
    item = FindItem(ItemName)

    if (!item) { 
        game_log("Buying + '" + ItemName + "'")
        buy(ItemName, 1)
        return
    }

    return
}

function EquipItem(ItemName, SlotLevel) {
    item = FindItem(ItemName)

    if (!item) {
        return
    }

    // game_log(SlotLevel)
    if (item.level > SlotLevel) {
        equip(ItemIndex(ItemName))
        game_log("Equiped " + item["name"])
        return;
    }

    return
}

/* Refill Functions */
var hp_potion_name = "hpot0"
var hp_potion_amount = 100
var hp_potion_min = 100

var ScrollName = "scroll0"
var ScrollMin = 10

function Refill() {
    RefillHealthPotions()

    RefillScrolls()
}

function RefillHealthPotions () {
    potion = FindItem(hp_potion_name)

    if (!potion || potion["q"] <= hp_potion_min) {
        buy(hp_potion_name, hp_potion_amount)
    }

    return
}

function RefillScrolls() {
    scroll = FindItem(ScrollName)

    if (!scroll || scroll["q"] <= ScrollMin) {
        buy(ScrollName, ScrollMin)
    }

    return
}

/* development Functions */

function Show(item) {
    if (item) {
        show_json(item);
    }

    return;
} 