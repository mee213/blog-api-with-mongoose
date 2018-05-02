const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


const {BlogPosts} = require('./models');

// we're going to add some blog posts to BlogPosts
// so there's some data to look at
BlogPosts.create(
  'The Perks of a Play-in-the-Mud Educational Philosophy', 'When did America decide preschool should be in a classroom?', 'Conor Williams', 'April 26, 2018');

BlogPosts.create(
  'The Tweeting of the Lambs: A Day in the Life of a Modern Shepherd', 'The hills of Cumbria, in northern England, are known as fells. They are among the wettest, coldest, and windiest places where sheep are farmed outdoors year-round. The weather is rotten, more or less, from October to May. So by lambing season—a three-week period, usually after Easter, when the ewes give birth, and there are triumphs and miscarriages, adoptions and accidents, gambolling and suckling—the flock, the shepherd, and the land itself are already worn out. “You’re just about fucked,” James Rebanks told me. “The whole thing is designed so you are just about to break.”'+
  'On Twitter, Rebanks is the Herdwick Shepherd. A little more than a hundred and nine thousand people, most of them trapped in office environments or riding public transportation, follow his account for gorgeous, wide-skied pictures of his flock, and for his evocations of the English countryside. In 2015, Rebanks’s memoir, “The Shepherd’s Life,” became an international best-seller, and he was compared to the nineteenth-century rural poet John Clare. Clare, the son of illiterate laborers from Northamptonshire, wrote about the land from within it; Rebanks’s writing has a similarly involved quality. When he feeds his ewes, he writes, “They line up behind me, with their heads down, like a massive scarf.” Rebanks has around five hundred sheep to look after, and when they’re lambing he has no time to write. He barely sleeps. “You are trying to keep things alive,” Rebanks said. “You make a mistake and something dies. And then—if you get through it—in a week or ten days’ time, the grass comes, the sun shines, and there is a feeling of absolute sheer exhaustion that turns to elation.”', 'Sam Knight', 'April 27, 2018');

BlogPosts.create(
  'Article You Should Read', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'Johnny Appleseed');

// send back JSON representation of all blog posts
// on GET requests to root
router.get('/', (req, res) => {
  res.json(BlogPosts.get());
});


// when new blog post added, ensure has required fields. if not,
// log error and return 400 status code with hepful message.
// if okay, add new item, and return it with a status 201.
router.post('/', jsonParser, (req, res) => {
  // ensure `title`, `content`, and `author` are in request body (`publishDate` is optional)
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  const item = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.publishDate);
  res.status(201).json(item);
});

// Delete recipes (by id)!
router.delete('/:id', (req, res) => {
  BlogPosts.delete(req.params.id);
  console.log(`Deleted blog post \`${req.params.ID}\``);
  res.status(204).end();
});

// when PUT request comes in with updated blog post, ensure has
// required fields. also ensure that blog post id in url path, and
// blog post id in updated item object match. if problems with any
// of that, log error and send back status code 400. otherwise
// call `BlogPosts.update` with updated blog post.
router.put('/:id', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author', 'id'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.id !== req.body.id) {
    const message = (
      `Request path id (${req.params.id}) and request body id `
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating blog post \`${req.params.id}\``);
  const updatedItem = BlogPosts.update({
    id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    publishDate: req.body.publishDate
  });
  res.status(200).json(updatedItem);
})

module.exports = router;
