const { mapValues } = require('./utils');

class Character {
    static from(data) {
        const c = new Character()
        c.data = data;
        return c;
    }

    getName() {
        return this.data.name;
    }

    getLevel() {
        return this.data.level;
    }

    getClass() {
        return this.data.class;
    }

    getArchetype() {
        return this.data.archetype;
    }

    getBackground() {
        return this.data.background;
    }

    getRace() {
        return this.data.race;
    }

    getAlignment() {
        return this.data.alignment;
    }

    getInspiration() {
        return this.data.inspiration;
    }

    getProficiencyBonus() {
        return this.data.proficiencyBonus;
    }

    getArmorClass() {
        return this.data.armorClass;
    }

    getInitiative() {
        return this.data.initiative;
    }

    getSpeed() {
        return this.data.speed;
    }

    getHitPoints() {
        return this.data.hitPoints;
    }

    getHitDice() {
        return this.data.hitDice;
    }

    getPassivePerception() {
        return this.data.passivePerception;
    }

    getAbilities() {
        return mapValues(this.data.abilityModifiers, score => ({
            score: score,
            modifier: Math.floor((score - 10) / 2),
        }));
    }

    getAbilityScores() {
        return mapValues(this.getAbilities(), ability => ability.score);
    }

    getAbilityModifiers() {
        return mapValues(this.getAbilities(), ability => ability.modifier);
    }

    getAbilityModifier(name) {
        const ret = this.getAbilityModifiers()[name];
        if (ret === undefined) {
            throw new Error(`Unknown ability: ${name}`);
        }
        return ret;
    }

    /** The yaml-formatted proficiency tree, excluding "other" proficiencies */
    getProficiencies() {
        return Object.fromEntries(
            Array.from(Object.entries(this.data.proficiencies))
                .filter(([key]) => key !== 'other')
        );
    }

    /** The unstructured proficiencies */
    getOtherProficiencies() {
        return this.data.proficiencies.other ?? [];
    }

    /** Proficiency tree, where each value is a number for the bonus amount */
    getProficiencyBonuses() {
        return mapValues(this.getProficiencies(), proficiencyCat =>
            mapValues(proficiencyCat, proficiency => {
                let bonus = 0;
                if (proficiency === 'proficient') {
                    bonus += this.getProficiencyBonus();
                }
                if (proficiency === 'expertise') {
                    bonus += this.getProficiencyBonus() * 2;
                }
                if (typeof proficiency === 'object') {
                    if (proficiency.proficiency === 'proficient') {
                        bonus += this.getProficiencyBonus();
                    }
                    if (proficiency.proficiency === 'expertise') {
                        bonus += this.getProficiencyBonus() * 2;
                    }
                    if (proficiency.extraBonus !== undefined) {
                        bonus += proficiency.extraBonus;
                    }
                }
                return bonus;
            })
        );
    }

    getSavingThrows() {
        const abilities = this.getAbilityModifiers();
        const bonuses = this.getProficiencyBonuses().savingThrows;

        console.log({ abilities, bonuses })

        const ret = {
            Strength: abilities.Strength + (bonuses.Strength ?? 0),
            Dexterity: abilities.Dexterity + (bonuses.Dexterity ?? 0),
            Constitution: abilities.Constitution + (bonuses.Constitution ?? 0),
            Intelligence: abilities.Intelligence + (bonuses.Intelligence ?? 0),
            Wisdom: abilities.Wisdom + (bonuses.Wisdom ?? 0),
            Charisma: abilities.Charisma + (bonuses.Charisma ?? 0),
        }
        this.getSavingThrows = () => ret;
        return ret;
    }

    getSkills() {
        const abilities = this.getAbilityModifiers();
        const bonuses = this.getProficiencyBonuses().skills;

        console.log({ abilities, bonuses })

        const ret = {
            Acrobatics: abilities.Dexterity + (bonuses.Acrobatics ?? 0),
            'AnimalHandling': abilities.Wisdom + (bonuses['AnimalHandling'] ?? 0),
            Arcana: abilities.Intelligence + (bonuses.Arcana ?? 0),
            Athletics: abilities.Strength + (bonuses.Athletics ?? 0),
            Deception: abilities.Charisma + (bonuses.Deception ?? 0),
            History: abilities.Intelligence + (bonuses.History ?? 0),
            Insight: abilities.Wisdom + (bonuses.Insight ?? 0),
            Intimidation: abilities.Charisma + (bonuses.Intimidation ?? 0),
            Investigation: abilities.Intelligence + (bonuses.Investigation ?? 0),
            Medicine: abilities.Wisdom + (bonuses.Medicine ?? 0),
            Nature: abilities.Intelligence + (bonuses.Nature ?? 0),
            Perception: abilities.Wisdom + (bonuses.Perception ?? 0),
            Performance: abilities.Charisma + (bonuses.Performance ?? 0),
            Persuasion: abilities.Charisma + (bonuses.Persuasion ?? 0),
            Religion: abilities.Intelligence + (bonuses.Religion ?? 0),
            'Sleight of Hand': abilities.Dexterity + (bonuses['Sleight of Hand'] ?? 0),
            Stealth: abilities.Dexterity + (bonuses.Stealth ?? 0),
            Survival: abilities.Wisdom + (bonuses.Survival ?? 0),
        }
        this.getSkills = () => ret;
        return ret;
    }
}

module.exports = { Character };