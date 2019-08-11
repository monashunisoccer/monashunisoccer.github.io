
export class MatchWrapper {

    /**
     * Process the raw JSON data we are passed in into useable data.
     *
     * @param _data
     */
    constructor(_data: any) {
        this.round = _data.match.round;
        this.date = new Date(_data.match.date);

        if (_data.match.opponent.endsWith(" away")) {
            this.them = _data.match.opponent.slice(0, -5);
            this.weAreListedHomeTeam = false;
        } else if (_data.match.opponent.endsWith(" home")) {
            this.them = _data.match.opponent.slice(0, -5);
            this.weAreListedHomeTeam = true;
        }
        else
            throw new Error("Found match with them not indicating who is the home team");

        this.ourPlayers = new Map<string, PlayerInMatch>();
        this.starter = new Map<string, PlayerInMatch>();
        this.bench = new Map<string, PlayerInMatch>();

        if (Array.isArray(_data.starter)) {
            _data.starter.forEach((p) => {
                let player = new PlayerInMatch(p);

                // handle the presence of an empty player name definition by ignoring
                // (the Player object itself will exception if it has both an empty name AND actual data)
                if (player.name) {
                    if (this.ourPlayers.has(player.name))
                        throw new Error("Player was listed twice");

                    this.ourPlayers.set(player.name, player);
                    this.starter.set(player.name, player);
                }

            });
        }

        if (Array.isArray(_data.bench)) {
            _data.bench.forEach((p) => {
                let player = new PlayerInMatch(p);

                if (player.name) {
                    if (this.ourPlayers.has(player.name))
                        throw new Error("Player was listed twice");

                    this.ourPlayers.set(player.name, player);
                    this.bench.set(player.name, player);
                }
            });
        }

        this.ourGoals = [];

        if (Array.isArray(_data.event)) {
            _data.event.forEach((e) => {
                // we map our known attributes
                if (e.goal_scored) {
                    this.ourGoals.push(new MatchEventGoalScored(e, this.ourPlayers));
                }
                if (e.substitution) {

                }
                if (e.yellow_card) {

                }
                if (e.red_card) {

                }
                if (e.penalty_saved) {

                }
            });


        }
    }

    readonly round: string;
    readonly date: Date;
    readonly them: string;

    readonly weAreListedHomeTeam: boolean;

    venue: string;
    result: string;

    readonly ourPlayers: Map<string, PlayerInMatch>;
    readonly ourFullTimeGoalsRecorded: number;
    readonly ourHalfTimeGoalsRecorded?: number;
    readonly ourGoals: MatchEventGoalScored[];

    readonly theirPlayers: Map<string, PlayerInMatch>;

    readonly starter: Map<string, PlayerInMatch>;
    readonly bench: Map<string, PlayerInMatch>;


    // | R | DATE | VENUE| OPP | RESULT | SCORERS | OTHER |
    // | --- | --- | --- | --- | --- | --- | --- |
    // | Cup1 | 24 Feb | A | Altona North      | 1-0 | OG                                       | Hendry (CS), Ganeson (CS)  |
    // | Cup2 | 3 Mar  | N | Brandon Park      | 1-2 | de Voogel 65′                            |  |
    // | 1 | 24 Mar  | A| Baxter               | 7-2 | Cummins 11′ 24′ 43′ 52′, Diamanka 47′, Kimijima 53′, De Voogel 57′ |  |
    // | 2 | 7 Apr   | A| Springvale City      | 3-1 | de Voogel 37′ 75′, Certoma 34′         |  |
    // | 3 | 14 Apr  | A| Dandenong South      | 1-1 | Clever 88′                               |  |
    // | 4 | 21 Apr  | A| Dandenong Warriors   | 3-3 | Diamanka 4′, Cummins 29′, de Faria 39′   |  |
    // | 5 | 28 Apr  | H| Noble Park           | 4-0 | Cummins 7′ 55′, Nikakhter 71′, Diamanka 80′  | Hendry (CS) |
    // | 6 | 5 May   | H| Endeavour United     | 0-0 |                                          | Hendry (CS) |
    // | 7 | 12 May  | A| Hampton Park         | 2-2 | de Voogel 31′, Kimijima 63′ (P)          |  |
    // | 8 | 19 May  | A| Sandringham          | 1-1 | Kimijima 50′ (P)                         |  |
    // | 9  | 26 May | A| Harrisfield          | 1-2 | Kimijima 62′ (P)                         |  |
    // | 10 | 2 Jun  | H| Keysborough          | 2-1 | Chorny 14′, Certoma 48′                  |  |
    // | 11 | 16 Jun | A| Sandown Lions        | 0-0 |                                          | Hendry (CS) |
    // | 12 | 23 Jun | H| Baxter               | 2-1 | Rodriquez 66′, Harvey 83′                | Mishra (RC)  |
    // | 13 | 30 Jun | H| Springvale City      | 1-0 | de Voogel 39′                            | Hendry (CS) |
    // | 14 | 7 Jul  | H| Dandenong South      | 2-1 | Ferrier 15′, Diamanka 81′                |  |
    // | 15 | 14 Jul | H| Dandenong Warriors   | 2-0 | Nikakhter 11′, Certoma 35′                | Hendry (CS) |
    // | 16 | 21 Jul | A| Noble Park           | 4-2 | Ferrier† 23′, Diamanka 29′ 54′, Eggleston 76′  |  |
    // | 17 | 28 Jul | A| Endeavour United     | 1-1 | Nikakhter 68′                             |  |
    // | 18 | 4 Aug  | H| Hampton Park         | 4-0 | Ferrier 6′, Nikakhter 22′, Certoma 52′, Diamanka 62′ | Hendry (CS, PS) |
    // | 19 | 11 Aug | H| Sandringham          | 3-0 | Nikakhter 60′ 88′, de Voogel 85′         | Hendry (CS) |
    // | 20 | 25 Aug | H| Harrisfield          | 2-0 | Ferrier 11′, Cummins 21′                 | Hendry (CS) |
    // | 21 | 1 Sep  | A| Keysborough          | 3-1 | Certoma 12′, Nikakhter 18′, Ferrier 79′   |  |
    // | 22 | 8 Sep  | H| Sandown Lions        | 5-1 | Certoma 20′ 59′ 81′, Ferrier 28′, Enright 90′   |  |
    // | Fin1 | 15 Sep | N| Ashburton (east)   | 2-1 | Certoma 31′ (P), Clever 90+2′   |  |
    // | Fin2 | 22 Sep | N| Lalor (north)      | 4-1 | Ferrier 78′, Certoma 87′, Bergmann 90+1′, Chorny 90+2′  |  |
    asResultMarkdownRow(): string {

        let parts: string[] = [];

        parts.push(this.round);
        parts.push(this.date.toLocaleDateString("en-US", { day: 'numeric', month: 'short'}));

        if (this.weAreListedHomeTeam)
            parts.push('H');
        else
            parts.push('A');

        parts.push(this.them);

        return '| ' + parts.join(' | ') + ' |';

    }

    asGoalSummary(): string {
        return "";
    }

}

class PlayerInMatch {

    constructor(_data: any) {
        // the player in match data we encounter is a dual level object (or dual with the inner object null)
        if (Object.keys(_data).length != 1) {
            throw new Error("Player data must be a dual level object keyed by the player name");
        }

        this.name = Object.keys(_data)[0];

        let _inner = _data[this.name];

        if (_inner) {
            this.shirt = _inner.shirt;
        }
    }

    readonly name: string;
    readonly shirt?: string = null;

    shortUniqueName(otherPlayers: IterableIterator<PlayerInMatch>) {
        return this.name.split(' ')[1];
    }
}

interface IMatchOfficial {

    coach?: string;

    team_manager?: string;
}




class MatchEvent {
    constructor(eventType: string, _data: any, players: Map<string, PlayerInMatch>) {
        let _inner = _data[eventType];

        if (_inner) {
            // someone was named for the goal - try to locate them as a player
            if (_inner.who) {
                if (players.has(_inner.who)) {
                    this.who = players.get(_inner.who);
                    this.when = _inner.when;
                } else {
                    throw new Error(`Named player ${_inner.who} for a ${eventType} event but they are not also listed in our players for this match`);
                }
            }
            else
                this.when = _inner.when;
        }

    }

    readonly who?: PlayerInMatch = null;
    readonly when?: string = null;
}

class MatchEventGoalScored extends MatchEvent {

    constructor(_data: any, players: Map<string, PlayerInMatch>) {
        // the event in match data we encounter is a dual level object (or dual with the inner object null)
        if (Object.keys(_data).length != 1) {
            throw new Error("Event data must be a dual level object keyed by the event type");
        }

        let eventType = Object.keys(_data)[0];

        super(eventType, _data, players);
    }
}

class MatchEventSubstitution extends MatchEvent {

    constructor(_data: any, players: Map<string, PlayerInMatch>) {
        // the event in match data we encounter is a dual level object (or dual with the inner object null)
        if (Object.keys(_data).length != 1) {
            throw new Error("Event data must be a dual level object keyed by the event type");
        }

        let eventType = Object.keys(_data)[0];

        super(eventType, _data, players);
    }
}

class MatchEventYellowCard extends MatchEvent {

    constructor(_data: any, players: Map<string, PlayerInMatch>) {
        // the event in match data we encounter is a dual level object (or dual with the inner object null)
        if (Object.keys(_data).length != 1) {
            throw new Error("Event data must be a dual level object keyed by the event type");
        }

        let eventType = Object.keys(_data)[0];

        super(eventType, _data, players);
    }
}
