var game = {};
var tmp = {};
var savegamename = 'savegame_' + $('#savegamename').text();

function init() {
    game = {
        stomach: 100,
        stomachcap: 500,
        stomachcapin: 0,
        stomachin: 0,

        energyin: 0,
        energy: 250,
        energycap: 10000,
        energycapin: 0,

        hydration: 250,
        hydrationin: 0,
        hydrationcap: 2500,
        hydrationcapin: 0,

        health: 1000,
        healthin: 0,
        healthcap: 1000,
        healthcaploss: 0,

        digestionmulti: 1,

        stamina: 200,
        staminacap: 200,
        staminaregen: 2,
        staminacapin: 0,

        temp: 36.6,
        tempoffsetp: 0,
        tempoffset: 0,
        tempgain: 0.01,

        moneyincome: 0,
        money: 0,
        time: 0,
        digested: 0,
        taxes: 0.4,
        unlocked: {},
        bought: {},
        eff: {
            0: {
                0: {

                }
            }
        },
        pause: false
    };

    tmp = {
        healthprev: 0
    };

    $('#log').text('');

    $.each($('.consumable'), function(i, button) {
        if ($(this).attr('money') < 0 && game.money < Math.abs($(this).attr('money'))) {
            $(this).addClass('hide');
        }
    });

    $.each($('.buyable'), function(i, div){
        if(!$(this).hasClass('hide')) {
            $(this).addClass('hide');
        }
    });
};

function log(msg) {
    $('#log').text(msg);
}

function rand(start, end) {
    return Math.floor(Math.random() * end) + start;
}

function randp() {
    return rand(0, 100);
}

function updateText() {
    $('#stomach').css('width', game.stomach / game.stomachcap * 100 + '%');
    $('#stomach').text(Math.round(game.stomach) + " / " + Math.round(game.stomachcap));

    $('#hydration').css('width', game.hydration / game.hydrationcap * 100 + '%');
    $('#hydration').text(Math.round(game.hydration) + " / " + Math.round(game.hydrationcap));

    $('#energy').css('width', game.energy / game.energycap * 100 + '%');
    $('#energy').text(Math.round(game.energy) + " / " + Math.round(game.energycap));

    $('#health').css('width', game.health / game.healthcap * 100 + '%');
    $('#health').text(Math.round(game.health) + " / " + Math.round(game.healthcap));

    $('#stamina').css('width', game.stamina / game.staminacap * 100 + '%');
    $('#stamina').text(Math.round(game.stamina) + " / " + Math.round(game.staminacap));

    $('#temp').text(Math.round((game.temp) * 10) / 10 + "C (" + Math.round(((game.temp) * 9 / 5 + 32) * 10) / 10 + "F)");

    $('#tempoffset').text(Math.round(game.tempoffset * 100) / 100 + "C");

    $('#temp').removeClass('label-success').removeClass('label-warning').removeClass('label-info').removeClass('label-danger');
    if(game.temp > 38) {
        $('#temp').addClass('label-danger');
    } else if(game.temp > 37) {
        $('#temp').addClass('label-warning');
    } else if(game.temp > 36) {
        $('#temp').addClass('label-success');
    } else {
        $('#temp').addClass('label-info');
    }

    $('#money').text(moneyWrite(game.money));

    $('#income').text(moneyWrite(game.moneyincome * game.taxes));

    var timestr;
    if (game.time < 120) {
        timestr = Math.round(game.time) + 's';
    } else if (game.time < 7200) {
        timestr = Math.round(game.time / 60) + 'm';
    } else {
        timestr = Math.round(game.time / 60 / 60) + 'h';
    }
    $('#time').text(timestr);

    var digstr;
    if (game.digested < 1000) {
        digstr = Math.round(game.digested);
    } else if (game.digested < 7200) {
        digstr = Math.round(game.digested / 60 * 100) / 100 + 'k';
    } else {
        digstr = Math.round(game.digested / 60 / 60 * 1000) / 1000 + 'M';
    }
    $('#digested').text(digstr + 'l');

    $('#taxes').text(Math.round((1 - game.taxes) * 100 * 1000) / 1000);
};

function moneyWrite(money) {
    money = Math.abs(parseFloat(money));
    var moneystr;

    if(money < 10000) {
        moneystr = Math.round(money * 100) / 100;
    } else if(money < Math.pow(10, 6)) {
        moneystr = Math.round(money / Math.pow(10, 3) * 100) / 100 + 'k';
    } else if(money < Math.pow(10, 9)) {
        moneystr = Math.round(money / Math.pow(10, 6) * 100) / 100 + 'M';
    } else if(money < Math.pow(10, 12)) {
        moneystr = Math.round(money / Math.pow(10, 9) * 100) / 100 + 'b';
    } else if(money < Math.pow(10, 15)) {
        moneystr = Math.round(money / Math.pow(10, 12) * 100) / 100 + 't';
    } else {
        moneystr = Math.round(money / Math.pow(10, 15) * 100) / 100 + 'Q';
    }

    return moneystr;
}

function updateStatus() {
    /* Unlocking items */
    $.each($('.consumable'), function(i, button) {
        /* If item is bought */
        if($(this).attr('unlock') != undefined && game.bought[$(this).attr('unlock')] != undefined) {
            $(this).addClass('hide');
        }
        else if (($(this).attr('money') < 0 && game.money >= Math.abs($(this).attr('money')) && $(this).hasClass('hide')) || ($(this).hasClass('hide') && game.unlocked[$(this).text()] != undefined)) {
            $(this).removeClass('hide');
            /* Saves to unlocked list */
            if(game.unlocked[$(this).text()] == undefined) {
                game.unlocked[$(this).text()] = true;
            }
        }
    });
     /* Items that user has bought */
    $.each($('.buyable'), function(i, div){
        if(game.bought[$(this).attr('buyname')] != undefined) {
            $(this).removeClass('hide');

            $('[unlock="' + $(this).attr('buyname') + '"]').addClass('hide');
        } else {
            $(this).addClass('hide');
        }
    });
    /* Can user afford? */
    $.each($('.consumable'), function(i, button) {
        if ($(this).attr('money') < 0 && game.money < Math.abs($(this).attr('money'))) {
            $(this).addClass('disabled');
        } else {
            $(this).removeClass('disabled');
        }
    });
}

function thoughts() {
    if(randp() > 90) {
        log('');
    }
    /* Stomach */
    if(game.stomach / game.stomachcap > 0.99) {
        log('Shit, I\'m vomiting!');
    } else if(game.stomach / game.stomachcap > 0.9 && randp() > 70) {
        log('I going to freaking vomit!');
    } else if(game.stomach / game.stomachcap > 0.8 && randp() > 80) {
        log('I feel really full');
    }

    if(game.stomach / game.stomachcap < 0.02) {
        if(randp() > 70) {
            log('My stomach hurts!');
        }
    } else if(game.stomach / game.stomachcap < 0.1) {
        if(randp() > 85) {
            log('I\'m feeling very hungry');
        }
    } else if(game.stomach / game.stomachcap < 0.2) {
        if(randp() > 85) {
            log('I feel like having a snack');
        }
    }

    /* Low energy */
    if(game.energy < 100 && randp() > 95) {
        log('I\'m feeling weak. I probably need to eat something');
    } else if(game.energy < 20 && randp() > 90) {
        log('I\'m feeling really weak. I should eat something!');
    } else if(game.energy < 5 && randp() > 85) {
        log('I\'m have no energy left. I need food!');
    }

    /* Low hydration */
    if(game.hydration < 100 && randp() > 95) {
        log('I feel like I need a drink');
    } else if(game.hydration < 20 && randp() > 90) {
        log('I really badly need a drink!');
    } else if(game.hydration < 5 && randp() > 80) {
        log('I really really badly need a drink!');
    }

    /* Low Stamina */
    if(game.stamina / game.staminacap < 0.1) {
        if(randp() > 90) {
            log('I \'m running out of breath!');
        }
    } else if(game.stamina / game.staminacap < 0.01) {
        if(randp() > 90) {
            log('My muscles hurt so badly!');
        }
    }

    /* Temp */
    if(game.temp > 40 && randp() > 95) {
        log('I feel like burning in hell');
    } else if(game.temp > 37.5 && randp() > 99) {
        log('I feel hot');
    }  else if(game.temp < 35.5 && randp() > 99) {
        log('I feel cold');
    } else if(game.temp < 34.0 && randp() > 95) {
        log('I\'m freezing to death');
    }

    /* Low HP */
    if(game.health / game.healthcap < 0.1 && randp() > 95) {
        log('I can imagine myself dying');
    } else if(game.health / game.healthcap < 0.05 && randp() > 95) {
        log('I feel my body shutting down...');
    } else if(game.health / game.healthcap < 0.01 && randp() > 90) {
        log('I\'m dying!');
    }
}

$(document).ready(function() {
    init();
    if(localStorage.getItem(savegamename) != undefined) {
        var loaded = JSON.parse(localStorage.getItem(savegamename));
        /* Writes */
        $.each(loaded, function(i, data){
            game[i] = data;
        });

        if(game.pause) {
            $('#pause').text('Unpause');
        } else {
            $('#pause').text('Pause');
        }
    }
    /* Initial text/graphs update */
    updateText();

    $('button.consumable').each(function() {
        $(this).text($(this).text() + ' (' + moneyWrite($(this).attr('money')) + '$)');

        if($(this).attr('stomach') != undefined) {
            $(this).attr('title', $(this).attr('title') + ' (' + $(this).attr('stomach') + 'g)');
        }
    });

    $('#reset').click(function(){
        if(confirm('Game will be reset. Continue?')) {
            init();
            log('I have commited a suicide');
        }
    });

    $('#pause').click(function(){
        game.pause = !game.pause;

        if(game.pause) {
            $(this).text('Unpause');
        } else {
            $(this).text('Pause');
        }
    });

    $('button.consumable').click(function() {
        if(game.pause) return;
        if ($(this).attr('money') > 0 || game.money >= Math.abs($(this).attr('money'))) {
            /* Buying unlockable */
            if($(this).attr('unlock') != undefined) {
                if(game.bought[$(this).attr('unlock')] == undefined) {
                    game.bought[$(this).attr('unlock')] = true;

                    $.each(this.attributes, function(i, attrib) {
                        if (attrib.name != 'class' && attrib.name != 'unlock') {
                            game[attrib.name] += parseFloat(attrib.value);
                        }
                    });
                }
            }
            else {
                 /* Buying consumable */
                $.each(this.attributes, function(i, attrib) {
                    if (attrib.name != 'class') {
                        if(attrib.name == 'tempoffset') {
                           game[attrib.name] = parseFloat(attrib.value);
                        }
                        else {
                           game[attrib.name] += parseFloat(attrib.value);
                        }
                    }
                });
            }

            updateStatus();
            updateText();
        }
    });

    window.setInterval(function() {

         /* Autosave */
        localStorage.setItem(savegamename, JSON.stringify(game));

        /* If game is paused */
        if(game.pause) return;

        /* Taxes */
        if(game.taxes > 1) {
            game.taxes = 1;
        } else if(game.taxes > 0.01) {
            game.taxes -= game.taxes * 0.00015;
        }
        game.money += game.moneyincome * game.taxes;

        /* If money runs out */
        if(game.money < 0) {
            game.taxes -= 0.00003;
        }

        game.time++;
        game.digestionmulti -= 0.000075;
        game.stomachcap += game.stomachcapin;

        /* Body temperature regulation */
        game.temp += game.tempoffset + game.tempoffsetp;
        var temp = game.temp;

        /* Deadly states */
        if(temp >= 42) {
            game.health *= 0.5;
            game.hydration *= 0.5;
            game.energy *= 0.5;
        } else if(temp >= 40) {
            game.health *= 0.95;
            game.hydration *= 0.95;
            game.energy *= 0.99;
        } else if(temp <= 34 && temp >= 32) {
            game.health *= 0.95;
            game.energy *= 0.95;
        } else if(temp < 32) {
            game.health *= 0.5;
            game.energy *= 0.5;
        }
        /* Regulation */
        var diff = temp - 36.6;
        var gain = diff * -1 * game.tempgain;

        if((gain < 0 && game.hydration / game.hydrationcap > 0.01) || (gain > 0 && game.energy / game.energycap > 0.01)) {
           game.temp += gain;
        }

        if(gain < 0) {
           game.hydration -= Math.abs(gain * 100);
        } else if(gain > 0) {
           game.energy -= Math.abs(gain * 100);
        }

        /* Health cap loss */
        if(game.healthcaploss > 0) {
            game.healthcap -= game.healthcaploss;
        } else {
            game.healthcaploss = 0;
        }

        /* Out of stamina condition */
        if(game.stamina <= 0) {
            game.stamina = 0;
            game.energy -= 3;
            game.hydration -= 5;
            game.health -= 0.01;
            game.staminacap -= 1;
        }

        /* Stamina regen */
        if(game.stamina >= game.staminacap) {
            game.stamina = game.staminacap;
        } else {
            if(game.energy > 1 && game.hydration > 1 && game.stamina <= game.staminacap) {
                game.stamina += game.staminaregen;
                game.energy -= 0.5;
                game.hydration -= 0.75;
            }
        }

        /* If no max stamina left */
        if(game.staminacap <= 0) {
            game.health *= 0.99;
        }

        /* No max hydration or energy left */
        if(game.hydrationcap <= 0 || game.energycap <= 0) {
            game.health *= 0.90;
        }

        /* Hydration and Energy cap increaes */
        game.energycap += game.energycapin;
        game.hydrationcap += game.hydrationcapin;

        /* Stamina cap decay/increase */
        game.staminacap += game.staminacapin;

        /* Heathloss/increase */
        game.health += game.healthin;

        /* Auto-injecting of resources */
        game.energy += game.energyin;
        game.hydration += game.hydrationin;
        game.stomach += game.stomachin;

        /* Idle resource consumption */
        if (game.energy > 0) game.energy -= 0.5;
        else game.energy = 0;

        if (game.hydration > 0) {
            game.hydration -= 0.75;

            if(game.temp < 36.8) {

            }
        }
        else {
            game.hydration = 0;
        }

        /* Empty stomach effect */
        if(game.stomach <= 0) {
            game.health *= 0.95;
        }

        /* Stomach destroyed */
        if(game.stomachcap <= 0) {
            game.health *= 0.95;
        }

        /* Digestion */
        if (game.stomach > 0) {
            var digest = 1 / ((game.stomach + 50) / game.stomachcap) * game.digestionmulti;

            game.stomach -= digest;
            game.digested += digest;
        }
        else {
            game.digested += Math.abs(game.stomach);
            game.stomach = 0;
        }

        /* Vomit */
        if (game.stomach > game.stomachcap) {
            game.stomach *= 0.1;
            game.energy *= 0.1;
            game.hydration *= 0.1;
            game.health *= 0.8;
            game.healthcap -= 0.01;
            game.stomachcap *= 0.75;
        }

        /* Hydration limit */
        if (game.hydration > game.hydrationcap) {
            game.hydration = game.hydrationcap;
        }
        /* Energy limit */
        if (game.energy > game.energycap) {
            game.energy = game.energycap;
        }
        /* Health limit */
        if (game.health >= game.healthcap) {
            game.health = game.healthcap;
        }

        /* Starvation and dehydration */
        if (game.energy <= 0) {
            game.health *= 0.99;
        }
        if (game.hydration <= 0) {
            game.health *= 0.95;
        }

        /* Stomach capacity */
        if (game.stomach / game.stomachcap > 0.5) {
            game.stomachcap += 0.1;
        } else {
            game.stomachcap -= 0.2;
        }

        /* Death */
        if (game.health <= 1) {
            var timestr;
            if (game.time < 120) {
                timestr = Math.round(game.time) + 's';
            } else if (game.time < 7200) {
                timestr = Math.round(game.time / 60) + 'm';
            } else {
                timestr = Math.round(game.time / 60 / 60) + 'h';
            }

            var digstr;
            if (game.digested < 1000) {
                digstr = Math.round(game.digested);
            } else if (game.digested < 7200) {
                digstr = Math.round(game.digested / 60 * 100) / 100 + 'k';
            } else {
                digstr = Math.round(game.digested / 60 / 60 * 1000) / 1000 + 'M';
            }

            alert('You have survived for ' + timestr + '. And you have digested ' + digstr + 'l');
            init();
        }

        /* Healing */
        if (game.health < game.healthcap && game.energy > 1000 && game.hydration > 1500 && game.temp < 37.1 && game.temp > 35.9 && game.stamina >= game.staminacap) {
            game.health *= 1.005;
            game.healthcap -= 0.001;
            game.energy -= 2;
            game.hydration -= 1;
        }

        /* Checking if character is loosing health */
        if(tmp.healthprev != 0 && tmp.healthprev < game.healthcap && Math.round(game.health) < Math.round(tmp.healthprev)) {
            /* Loosing health */
            $('body').css('background', '#E55B3C');
        } else {
            $('body').css('background', 'white');
        }

        tmp.healthprev = game.health;

        updateStatus();

        /* Characters thinking */
        thoughts();

        updateText();
    }, 1000);
});
