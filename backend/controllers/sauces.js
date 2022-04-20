const Sauces = require('../models/sauces');
const fs = require('fs');
const sauces = require('../models/sauces');

// exports.creatSauces = (req, res, next) => {
//     delete req.body._id;
//     const sauces = new Sauces({
//         ...req.body
//     })
//     sauces.save()
//         .then(() => res.status(201).json({ message: 'object enregistre !' }))
//         .catch(error => res.status(400).json({ error }));
// }

exports.creatSauce = (req, res, next) => {
    const saucesObject = JSON.parse(req.body.sauce);
    delete saucesObject._id;
    const sauces = new Sauces({
        ...saucesObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []

    });

    sauces.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};

// exports.modifySauces = (req, res, next) => {
//     Sauces.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
//         .then(() => res.status(200).json({ message: 'object modifie !' }))
//         .catch(error => res.status(400).json({ error }));
// }
exports.modifySauce = (req, res, next) => {
    const saucesObject = req.file ?
        {
            ...JSON.parse(req.body.sauces),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    sauces.updateOne({ _id: req.params.id }, { ...saucesObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
        .catch(error => res.status(400).json({ error }));
};


// exports.deleteSauces = (req, res, next) => {
//     sauces.deleteOne({ _id: req.params.id })
//         .then(() => res.status(200).json({ message: 'object supprime !' }))
//         .catch(error => res.status(400).json({ error }));
// }
exports.deleteSauce = (req, res, next) => {
    Sauces.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            console.log("")
            console.log(filename)
            fs.unlink(`images/${filename}`, () => {
                Sauces.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauces.findOne({ _id: req.params.id })
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(404).json({ error }));
}
exports.getAllSauces = (req, res, next) => {
    Sauces.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
}

exports.likesSauce = (req, res, next) => {
    const userId = req.body.userId;
    console.log(userId)
    const like = req.body.like;
    console.log('like')
    console.log(like)
    const sauceId = req.params.id;
    console.log(sauceId)
    Sauces.findOne({ _id: sauceId })
        .then(sauce => {
            // nouvelles valeurs à modifier
            const newValues = {
                usersLiked: sauce.usersLiked,
                usersDisliked: sauce.usersDisliked,
                likes: 0,
                dislikes: 0
            }
            console.log(newValues)
            // Différents cas:
            switch (like) {
                case 1:  // CAS: sauce liked
                    newValues.usersLiked.push(userId);
                    console.log(newValues)
                    break;
                case -1:  // CAS: sauce disliked
                    newValues.usersDisliked.push(userId);
                    break;
                case 0:  // CAS: Annulation du like/dislike
                    if (newValues.usersLiked.includes(userId)) {
                        // si on annule le like
                        const index = newValues.usersLiked.indexOf(userId);
                        newValues.usersLiked.splice(index, 1);
                    } else {
                        // si on annule le dislike
                        const index = newValues.usersDisliked.indexOf(userId);
                        newValues.usersDisliked.splice(index, 1);
                    }
                    break;
            };
            // Calcul du nombre de likes / dislikes
            newValues.likes = newValues.usersLiked.length;
            newValues.dislikes = newValues.usersDisliked.length;
            // Mise à jour de la sauce avec les nouvelles valeurs
            Sauces.updateOne({ _id: sauceId }, newValues)
                .then(() => res.status(200).json({ message: 'Sauce notée !' }))
                .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }));
}