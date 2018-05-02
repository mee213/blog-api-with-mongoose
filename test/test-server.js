const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

// this lets us use *expect* style syntax in our tests
// so we can do things like `expect(1 + 1).to.equal(2);`
// http://chaijs.com/api/bdd/
const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('Blog Posts', function() {

	// Before our tests run, we activate the server. Our `runServer`
	// function returns a promise, and we return the that promise by
	// doing `return runServer`. If we didn't return a promise here,
	// there's a possibility of a race condition where our tests start
	// running before our server has started.
	before(function() {
		return runServer();
	});

	// although we only have one test module at the moment, we'll
	// close our server at the end of these tests. Otherwise,
	// if we add another test module that also has a `before` block
	// that starts our server, it will cause an error because the
	// server would still be running from the previous tests.
	after(function() {
		return closeServer();
	});

	// test strategy:
	//   1. make request to `/blog-posts`
	//   2. inspect response object and prove has right code and have
	//   right keys in response object.
	it('should list blog posts on GET', function() {
		// for Mocha tests, when we're dealing with asynchronous operations,
		// we must either return a Promise object or else call a `done` callback
		// at the end of the test. The `chai.request(server).get...` call is asynchronous
		// and returns a Promise, so we just return it.
		return chai.request(app)
			.get('/blog-posts')
			.then(function(res) {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.a('array');

				// because we create three items on app load
				expect(res.body.length).to.be.at.least(1);
				
				// each blog post should be an object with key/value pairs
				// for `id`, `title`, `content`, `author`, and `publishDate`
				const expectedKeys = ['id', 'title', 'content', 'author', 'publishDate'];
				res.body.forEach(function(item) {
					expect(item).to.be.a('object');
					expect(item).to.include.keys(expectedKeys);
				});
			});
	});

	// test strategy:
	//  1. make a POST request with data for a new blog post
	//  2. inspect response object and prove it has right
	//  status code and that the returned object has an `id`
	it('should add a blog post with a user-specified date on POST', function() {
		const newItem = {
	        title: "America is obsessed with the virtue of work. What about the virtue of rest?",
	        content: "There’s a balance to be struck where it comes to work and rest, but in the United States, values and laws are already slanted drastically in favor of work. I would advise those concerned about Americans’ dignity, freedom and independence to not focus on compelling work for benefits or otherwise trying to marshal people into jobs when what they really need are health care, housing assistance, unemployment benefits and so forth. Instead, we should focus more of our political energies on making sure that American workers have the dignity of rest, the freedom to enjoy their lives outside of labor and independence from the whims of their employers.",
	        author: "Elizabeth Bruenig",
	        publishDate: "April 25, 2018"
	    };
		return chai.request(app)
			.post('/blog-posts')
			.send(newItem)
			.then(function(res) {
				expect(res).to.have.status(201);
				expect(res).to.be.json;
				expect(res.body).to.be.a('object');
				expect(res.body).to.include.keys('id', 'title', 'content', 'author', 'publishDate');
				expect(res.body.id).to.not.equal(null);
				
				// response should be deep equal to `newItem` from above if we assign
				// `id` to it from `res.body.id`
				expect(res.body).to.deep.equal(Object.assign(newItem, {id: res.body.id}));
			});
	});

	// test strategy:
	//  1. make a POST request with data for a new blog post
	//  2. inspect response object and prove it has right
	//  status code and that the returned object has an `id`
	it('should add a blog post with an automatically-generated date on POST', function() {
		const newItem = {
	        title: "America is obsessed with the virtue of work. What about the virtue of rest?",
	        content: "There’s a balance to be struck where it comes to work and rest, but in the United States, values and laws are already slanted drastically in favor of work. I would advise those concerned about Americans’ dignity, freedom and independence to not focus on compelling work for benefits or otherwise trying to marshal people into jobs when what they really need are health care, housing assistance, unemployment benefits and so forth. Instead, we should focus more of our political energies on making sure that American workers have the dignity of rest, the freedom to enjoy their lives outside of labor and independence from the whims of their employers.",
	        author: "Elizabeth Bruenig"
	    };
		return chai.request(app)
			.post('/blog-posts')
			.send(newItem)
			.then(function(res) {
				expect(res).to.have.status(201);
				expect(res).to.be.json;
				expect(res.body).to.be.a('object');
				expect(res.body).to.include.keys('id', 'title', 'content', 'author', 'publishDate');
				expect(res.body.id).to.not.equal(null);
				
				// response should be deep equal to `newItem` from above if we assign
				// `id` to it from `res.body.id` and `publishDate` from `res.body.publishDate`
				expect(res.body).to.deep.equal(Object.assign(newItem, {id: res.body.id, publishDate: res.body.publishDate}));
			});
	});

	// test strategy:
	//  1. initialize some update data (we won't have an `id` yet)
	//  2. make a GET request so we can get an item to update
	//  3. add the `id` to `updateData`
	//  4. Make a PUT request with `updateData`
	//  5. Inspect the response object to ensure it
	//  has right status code and that we get back an updated
	//  item with the right data in it.
	it('should update blog posts on PUT', function() {
		// we initialize our updateData here and then after the initial
		// request to the app, we update it with an `id` property so
		// we can make a second, PUT call to the app.
		const updateData = {
			title: "America is obsessed with the virtue of work. What about the virtue of rest?",
	        content: "There’s a balance to be struck where it comes to work and rest, but in the United States, values and laws are already slanted drastically in favor of work. I would advise those concerned about Americans’ dignity, freedom and independence to not focus on compelling work for benefits or otherwise trying to marshal people into jobs when what they really need are health care, housing assistance, unemployment benefits and so forth. Instead, we should focus more of our political energies on making sure that American workers have the dignity of rest, the freedom to enjoy their lives outside of labor and independence from the whims of their employers.",
	        author: "Elizabeth Bruenig",
	        publishDate: "April 25, 2018"
		};

		return chai.request(app)
			// first have to get so we have an idea of object to update
			.get('/blog-posts')
			.then(function(res) {
				updateData.id = res.body[0].id;
				// this will return a promise whose value will be the response
				// object, which we can inspect in the next `then` block. Note
				// that we could have used a nested callback here instead of
				// returning a promise and chaining with `then`, but we find
				// this approach cleaner and easier to read and reason about.
				return chai.request(app)
					.put(`/blog-posts/${updateData.id}`)
					.send(updateData);
			})
			// prove that the PUT request has right status code
			// and returns updated item
			.then(function(res) {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.a('object');
				expect(res.body).to.deep.equal(updateData);
			});
	});

	// test strategy:
	//  1. GET blog posts so we can get ID of one
	//  to delete.
	//  2. DELETE a blog post and ensure we get back a status 204
	it('should delete blog posts on DELETE', function() {
		return chai.request(app)
			// first have to get so we have an `id` of blog post
			// to delete
			.get('/blog-posts')
			.then(function(res) {
				return chai.request(app)
					.delete(`/blog-posts/${res.body[0].id}`);
			})
			.then(function(res) {
				expect(res).to.have.status(204);
			});
	});


});