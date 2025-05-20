-- We need to first create the two respective data tables that hold both the auction listings and the listing bidders

-- Auction Table:
CREATE TABLE auction (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(225) NOT NULL,
    img_url VARCHAR(225) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(225) NOT NULL,
    end_date DATETIME NOT NULL
);

-- Bids Table:
-- Here we have to create a link between each bid to the respective listing that each are connected to... We also have to decide
-- how we will go about deleting bids from the bids table when we delete a listing
CREATE TABLE bid (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(225) NOT NULL,
    amount BIGINT(19) NOT NULL,
    comment TEXT,
    listing_id INT NOT NULL,
    FOREIGN KEY (listing_id) REFERENCES auction(id) ON DELETE CASCADE
);
-- Above I decided to use on delete cascade as a way to link the two tables together on delete occurrences...
-- The way this works is it pairs on the parents-child relationship between auction and bid
-- The child table(bid) will delete any corresponding rows when its parent table(auction) has a delete request


-- Here are the intial listings that will be in the auction table by default
INSERT INTO auction (title, img_url, description, category, end_date) VALUES
("Ancient Dragon Smithing Stone", "https://assetsio.gnwcdn.com/elden-ring-ancient-dragon-smithing-stone_MnrBofo.jpg", "Smithing stone made by polishing a golden Gravel Stone. A scale of the Ancient Dragonlord, and hidden treasure of Farum Azula", "Crafting Material", "2024-12-29"),
("Godskin Swaddling Cloth","https://static.wikia.nocookie.net/eldenring/images/3/33/ER_Icon_Talisman_Godskin_Swaddling_Cloth.png","The Gloam-Eyed Queen cradles newborn apostles swaddled in this cloth. Soon they will grow to become the death of the gods.", "Talisman", "2024-12-31"),
("Dragoncrest Greatshield Talisman", "https://static.wikia.nocookie.net/eldenring/images/1/17/ER_Icon_Talisman_Dragoncrest_Greatshield_Talisman.png", "Legendary talisman of wrought iron depicting a massive ancient dragon. Enormously boosts physical damage negation.", "Talisman", "2024-11-01"),
("Hefty Beast Bone", "https://static.wikia.nocookie.net/eldenring/images/5/58/ER_Icon_material_hefty_beast_bone.png", "Thick, solid beast bones. Material used for crafting items. Found by hunting particularly large beasts. Commonly Used to make disposable weapons.", "Crafting Material", "2024-12-19"),
("Furious Blade of Ansbach", "https://static.wikia.nocookie.net/eldenring/images/5/59/ER_Icon_Spell_Furious_Blade_of_Ansbach.png", "Markedly different from the finessed swordplay of the dynast, this is an aggressive last resort of an incantation that gave rise to Ansbach's fearsome reputation.", "Incantation", "2024-12-31"),
("Stone of Gurranq", "https://static.wikia.nocookie.net/eldenring/images/9/9e/ER_Icon_Spell_Stone_of_Gurranq.png", "Hurls a boulder before the caster. This incantation can be cast repeatedly.", "Incantation", "2024-12-02");

-- Here are the intial bids that exist for each listing
INSERT INTO bid (name, amount, comment, listing_id) VALUES
("Slave Knight Gael", 50000, "I can escape the painted world with this... I'm using everything I have!!!", 1),
("Abyss Walker Artorias", 45000, "This shall be a fine gift for my sweet puppy friend", 1),
("Bayle the Dread", 40000, "HAHAHAHA I stole Placidusax's scale get rektttt!", 1),
("One Random Belfry Gargoyle", 20000, "RRAHAHHAHRHAHHRHHEEEEREHHHHH", 1),
("Messmer the Impaler", 15000, "Mother, may thine self covet such an item?", 1),
("Witless Tarnished", 1000, "Wow I'm a witless tarnished what is this item?", 1),
("Diseased Hound", 50, "What an exquisit item mine goodness!! Too bad I'm a diseased hound with no runes other than this 50 I have...", 1),
("PriorLakeTransmission", 25000, "I'd like to use this cloth to wipe up leaked oil", 2),
("Tom Bombadill", 24000, "I am the reincarnation of god I might was well cop", 2),
("Golden Freddy", 23000, "'Sits in g-freddy pose' RRRRAAAHHHHHHHHHHHH!!!!", 2),
("Cameron", 150000, "Tis a legendary talisman I will do anything to acquire this", 3),
("Brody", 100000, "I take so much damage this is much needed!", 3),
("Mara", 50000, "IDRK what this item even is so I'll just throw some change", 3),
("Mike Tyson", 800, "I'm the greatetht and motht ruthleth champion that ever lived!", 4),
("Darth Maul", 750, "How sick would a lightsaber with a beast bone hilt be!!", 4),
("Sir Ansbach", 100000, "Who dares to sell mine own Incantation? I cannot let this stand...", 5),
("Aragorn", 43000, "Ah, a fine incantation for the Lord of Gondor", 5),
("Jon Snow", 40000, "Just what a lord of the north needs to fend off the death beyond the wall", 5),
("Maliketh the Black Blade", 98989, "Ahh Stone of Gurranq, become my boulder once more...", 6),
("Some Stoner", 87878, "Brooooo, that stone would go craaaazyyyyy!", 6),
("Beef Elliengton", 76767, "I pooped out a boulder this big the other day", 6);