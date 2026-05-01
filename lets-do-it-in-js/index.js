const fs = require('node:fs/promises');
const { Character } = require('./lib/character');

(async () => {

    const char = await Character.fromFile('./characters/silas.yaml');

    const abilityCategories = categorizeBy(char.getAbilitiesList(), 'category');

    await fs.mkdir('./tex', { recursive: true });
    const out = await fs.open('./tex/silas.tex', 'w')
    await out.write('\\documentclass{article}\n');
    await out.write('\\usepackage[margin=0.6in]{geometry}\n');
    await out.write('\\begin{document}\n');
    await out.write('\\thispagestyle{empty}\n')

    // Character stats page
    const abilityScores = char.getAbilityScores();
    const abilityMods = char.getAbilityModifiers();
    function modStr(n) { return (n >= 0 ? '+' : '') + n; }

    await out.write('\\begin{center}\n');
    await out.write(`\\LARGE\\textbf{${char.getName()}}\\\\\n`);
    await out.write(`\\large ${char.getRace()} ${char.getClass()} (Level ${char.getLevel()})\\\\\n`);
    await out.write(`${char.getBackground()}\\\\\n`);
    await out.write(`${char.getAlignment()}\n`);
    await out.write('\\end{center}\n');
    await out.write('\\vspace{0.15in}\n');

    await out.write('\\begin{tabular}{ l l l l }\n');
    await out.write(`AC: & ${char.getArmorClass()} & HP: & ${char.getHitPoints()} ` + '\\\\' + '\n');
    await out.write(`Speed: & ${char.getSpeed()} & Init: & ${char.getInitiative()} ` + '\\\\' + '\n');
    await out.write(`Prof Bonus: & ${char.getProficiencyBonus()} & Hit Die: & ${char.getHitDice()} ` + '\\\\' + '\n');
    await out.write(`Spell Save DC: & ${char.getSpellSaveDC()}` + '\\\\' + '\n');
    await out.write('\\end{tabular}\n');
    await out.write('\\vspace{0.15in}\n');

    await out.write('\\section*{Saving Throws}\n');
    const savingThrows = char.getSavingThrows();
    await out.write('\\begin{tabular}{ l c l c }\n');
    await out.write(`Strength & +${savingThrows.Strength} & Dexterity & +${savingThrows.Dexterity} ` + '\\\\' + '\n');
    await out.write(`Constitution & +${savingThrows.Constitution} & Intelligence & +${savingThrows.Intelligence} ` + '\\\\' + '\n');
    await out.write(`Wisdom & +${savingThrows.Wisdom} & Charisma & +${savingThrows.Charisma} ` + '\\\\' + '\n');
    await out.write('\\end{tabular}\n');
    await out.write('\\\\\n');

    await out.write('\\section*{Ability Scores}\n');
    await out.write('\\begin{tabular}{ l c c l c c }\n');
    await out.write(`Strength & ${abilityScores.Strength} & ${modStr(abilityMods.Strength)} & Dexterity & ${abilityScores.Dexterity} & ${modStr(abilityMods.Dexterity)} ` + '\\\\' + '\n');
    await out.write(`Constitution & ${abilityScores.Constitution} & ${modStr(abilityMods.Constitution)} & Intelligence & ${abilityScores.Intelligence} & ${modStr(abilityMods.Intelligence)} ` + '\\\\' + '\n');
    await out.write(`Wisdom & ${abilityScores.Wisdom} & ${modStr(abilityMods.Wisdom)} & Charisma & ${abilityScores.Charisma} & ${modStr(abilityMods.Charisma)} ` + '\\\\' + '\n');
    await out.write('\\end{tabular}\n');
    await out.write('\\\\\n');

    const skills = char.getSkills();
    const skillOrder = [
        ['Acrobatics', 'Acrobatics'],
        ['Animal Handling', 'AnimalHandling'],
        ['Arcana', 'Arcana'],
        ['Athletics', 'Athletics'],
        ['Deception', 'Deception'],
        ['History', 'History'],
        ['Insight', 'Insight'],
        ['Intimidation', 'Intimidation'],
        ['Investigation', 'Investigation'],
        ['Medicine', 'Medicine'],
        ['Nature', 'Nature'],
        ['Perception', 'Perception'],
        ['Performance', 'Performance'],
        ['Persuasion', 'Persuasion'],
        ['Religion', 'Religion'],
        ['Sleight of Hand', 'Sleight of Hand'],
        ['Stealth', 'Stealth'],
        ['Survival', 'Survival'],
    ];

    await out.write('\\section*{Skills}\n');
    await out.write('\\begin{tabular}{ l c l c }\n');
    for (let i = 0; i < skillOrder.length; i += 2) {
        const left = skillOrder[i];
        const right = skillOrder[i + 1];
        const leftVal = skills[left[1]];
        const rightVal = right ? skills[right[1]] : '';
        const leftCell = `${left[0]} & ${modStr(leftVal)} `;
        const rightCell = right ? `& ${right[0]} & ${modStr(rightVal)} ` : '& & ';
        await out.write(leftCell + rightCell + '\\\\' + '\n');
    }
    await out.write('\\end{tabular}\n');
    await out.write('\\\\\n');

    await out.write('\\begin{tabular}{ l c }\n');
    await out.write(`Passive Wisdom (Perception) & ${char.getPassivePerception()} \\\\` + '\n');
    await out.write('\\end{tabular}\n');
    await out.write('\\\\\n');

    await out.write('\\section*{Other Proficiencies}\n');
    await out.write('\\raggedright\n');
    for (const prof of char.getOtherProficiencies()) {
        await out.write(`\\mbox{\\textbullet\\quad ${prof}\\quad}\n`);
    }


    const equipment = char.getEquipment && char.getEquipment();
    await out.write('\\section*{Equipment}\n');
    await out.write('\\raggedright\n');
    for (const item of equipment) {
        if (typeof item === 'object') {
            if (item.count !== undefined) {
                await out.write(`\\mbox{\\textbullet\\quad ${item.count} x ${item.name}\\quad}\n`);
            } else if (item.name) {
                await out.write(`\\mbox{\\textbullet\\quad ${item.name}\\quad}\n`);
            } else {
                await out.write(`\\mbox{\\textbullet\\quad ${JSON.stringify(item)}\\quad}\n`);
            }
        } else {
            await out.write(`\\mbox{\\textbullet\\quad ${item}\\quad}\n`);
        }
    }


    await out.write('\\clearpage\n');
    await out.write('\\thispagestyle{empty}\n');
    await out.write('\\mbox{}\n');
    await out.write('\\clearpage\n');
    await out.write('\\twocolumn\n');
    await out.write('\\setcounter{page}{1}\n');

    for (const [category, abilities] of Object.entries(abilityCategories)) {
        const hasReference = abilities.some(a => !a.skipReference);
        await out.write(`\\section${hasReference ? '' : '*'}{${hasReference ? '' : '\\phantom{1}\\quad '}${category}}\n`);

        for (const ability of abilities) {
            await out.write(`${getAbilitySubsection(ability)}\n`);
            const type = getAbilityType(ability);
            if (type.type === 'weapon') {
                let bonus = char.getAbilityModifier(type.ability);
                if (type.proficiency === 'proficient') {
                    bonus += char.getProficiencyBonus();
                }
                if (type.proficiency === 'expertise') {
                    bonus += char.getProficiencyBonus() * 2;
                }
                if (type.extraAttackBonus) {
                    bonus += type.extraAttackBonus;
                }
                await out.write(`+${bonus} to hit; ${type.damage} damage`);
                if (ability.oneline) {
                    await  out.write('; ');
                }
            }
            await out.write(`${ability.oneline}\n\n`);
        }
    }

    await out.write('\\clearpage\n');
    await out.write('\\setcounter{section}{0}\n');

    const referenceCategories= Object.fromEntries(
        Array.from(Object.entries(abilityCategories))
            .map(([category, abilities]) => [
                category,
                abilities.filter(a => !a.skipReference)
            ])
            .filter(([category, abilities]) => abilities.length > 0)
    )

    for (const [category, abilities] of Object.entries(referenceCategories)) {
        await out.write(`\\section{${category}}\n`);

        for (const ability of abilities) {
            const type = getAbilityType(ability);
            await out.write(getAbilitySubsection(ability));
            await out.write('\n');
            if (type.castingTime) {
                await out.write(`\\noindent\\textbf{Casting Time}: ${type.castingTime}\n\n`);
            }
            if (type.range) {
                await out.write(`\\noindent\\textbf{Range}: ${type.range} feet\n\n`);
            }
            if (type.duration) {
                await out.write(`\\noindent\\textbf{Duration}: ${type.duration}\n\n`);
            }
            await out.write(`${ability.description}\n\n`);
        }
    }


    await out.write('\\end{document}\n');

    await out.close();

})().catch(err => {
    console.error(err);
    process.exit(1);
})

function categorizeBy(items, key) {
    const ret = {};
    for (const item of items) {
        const cat = item[key];
        if (!ret[cat]) {
            ret[cat] = [];
        }
        ret[cat].push(item);
    }
    return ret;
}

function getAbilityType(ability) {
    if ('weapon' in ability) {
        return {
            type: 'weapon',
            ...ability.weapon,
        }
    }
    if ('ability' in ability) {
        return {
            type: 'ability',
            ...ability.ability,
        }
    }
    if ('cantrip' in ability) {
        return {
            type: 'cantrip',
            ...ability.cantrip,
        }
    }
    if ('spell' in ability) {
        return {
            type: 'spell',
            ...ability.spell,
        }
    }

    return { type: 'unknown' };
}

function getAbilitySubsection(ability) {
    const type = getAbilityType(ability);
    let ret = `\\subsection${!!ability.skipReference ? '*' : ''}{`;
    if (ability.skipReference) {
        ret += '\\phantom{1.1}\\quad ';
    }
    switch(type.type) {
        case 'weapon':
        case 'ability':
            break;
        case 'cantrip':
            ret += 'Cantrip - ';
            break;
        case 'spell':
            ret += `Level ${type.level} Spell - `;
            break;
    }
    ret += ability.name;
    ret += '}';

    return ret;
}
