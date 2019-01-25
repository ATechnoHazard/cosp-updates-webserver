const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator/check');
const router = express.Router();
const Device = mongoose.model('Device');

router.get('/', (req, res) => {
    res.render('form', { title: 'COSP Updates'});
});

router.get('/checkUpdate', async (req, res) => {
    const reqDevice = req.query.device;
    const deviceBuild = Number(req.query.date);
    await Device.findOne({ device: reqDevice }, async (err, device) => {
        if (Number(device.get('buildDate')) > deviceBuild) {
            res.send({ update: true, download: await device.get('download'), changeLog: await device.get('changeLog')});
        } else {
            res.send({ update: false, download: '' , changeLog: ''});
        }
    });
});

// Submit route
router.post('/',
    [
        body('device')
            .isLength({ min: 1 })
            .withMessage('Please enter the device name.'),
        body('maintainer')
            .isLength({ min: 1 })
            .withMessage('Please enter the maintainer\'s name'),
        body('buildDate')
            .isLength({ min: 1 })
            .withMessage('Please enter the build date.'),
        body('changeLog')
            .isLength({ min: 1 })
            .withMessage('Please enter the changelog.'),
        body('download')
            .isURL({ require_valid_protocol: true })
            .withMessage('Please enter a valid URL')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            try {
                await Device.findOne({ device: req.body.device }, async (err, device) => {
                    if (err || device === null) {
                        const device = new Device(req.body);
                        await device.save(err => {
                            if (err) console.log(err);
                            res.send('Created device successfully.');
                        });

                    } else {
                        await device.set(req.body);
                        await device.save((err) => {
                            if (err) console.log(err);
                            res.send('Updated successfully.')
                        });
                    }
                });
            } catch (e) {}
        } else {
            res.render('form', {
                title: 'COSP Updates',
                errors: errors.array(),
                data: req.body
            });
        }
        console.log(req.body);
    });

module.exports = router;