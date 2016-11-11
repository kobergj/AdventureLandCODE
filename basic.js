// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!

var HPSWITCH = 200
var MPSWITCH = 500

var monster_maxatk = 120
var monster_minxp = 100
var monster_name = null
var monster_notarget = true

var movementspeed_x = 10
var movementspeed_y = 10

var attack_mode=true

var attack_target_off = null
var maxhp_target = 300

setInterval(function(){

    if(character.hp < HPSWITCH || character.mp < MPSWITCH){
        use_hp_or_mp();
    }

    loot();

    if(!attack_mode || character.moving) return;

    var target=get_targeted_monster();
    if(!target)
    {
        if (attack_target_off!=null){
            player = get_player(attack_target_off)
            target = get_target_of(player)
        } else {
            target=get_nearest_monster({min_xp:monster_minxp,max_att:monster_maxatk, target:monster_name, no_target:monster_notarget});
        }

        if(target) change_target(target);
        else
        {
            if (attack_target_off!=null){
                set_message("Go to " + player.name)
                move(
                    character.real_x+(player.real_x-character.real_x-1),
                    character.real_y+(player.real_y-character.real_y-1)
                );
                return
            }
            set_message("No Monsters");
            move(
                character.real_x + movementspeed_x,
                character.real_y + movementspeed_y
            );
            return;
        }
    }
    
    if(!in_attack_range(target))
    {
        move(
            character.real_x+(target.real_x-character.real_x)/2,
            character.real_y+(target.real_y-character.real_y)/2
            );
        // Walk half the distance
    }
    else if(can_attack(target))
    {
        set_message("Attacking" + " " + target.mtype);
        if(attack_target_off!=null){
            if(target.hp < maxhp_target) {
                attack(target);
                return
            }
        }
        attack(target);
    }

},100); // Loops every 100 milisecs

// NOTE: If the tab isn't focused, browsers slow down the game
// Learn Javascript: https://www.codecademy.com/learn/javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
