const request = require('supertest');
const app = require('../app'); 

describe('Movie API Endpoints', () => {
  // Mock data for testing
  const mockMovie = {
    MovieTitle: 'Mock Movie',
    genre: 'Action',
    Rating: 8.0,
    Streaminglink: 'example.com/mock-movie',
  };

  let movieId; 

  // Test GET /movies endpoint
  describe('GET /movies', () => {
    it('should get all movies', async () => {
      const response = await request(app).get('/movies');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.any(Array));
    });
  });

  // Test POST /movies endpoint
  describe('POST /movies', () => {
    it('should add a new movie', async () => {
      const response = await request(app).post('/movies').send(mockMovie);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Movie added successfully');
      expect(response.body).toHaveProperty('movie.MovieTitle', mockMovie.MovieTitle);
      movieId = response.body.movie._id;
    });
  });

  // Test PUT /movies/:id endpoint
  describe('PUT /movies/:id', () => {
    it('should update an existing movie', async () => {
      const updatedMovie = { ...mockMovie, Rating: 9.0 };
      const response = await request(app).put(`/movies/${movieId}`).send(updatedMovie);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Movie updated successfully');
      expect(response.body).toHaveProperty('movie.MovieTitle', updatedMovie.MovieTitle);
      expect(response.body.movie.Rating).toBe(updatedMovie.Rating);
    });
  });

  // Test DELETE /movies/:id endpoint
  describe('DELETE /movies/:id', () => {
    it('should delete an existing movie', async () => {
      const response = await request(app).delete(`/movies/${movieId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Movie deleted successfully');
      expect(response.body.movie._id).toBe(movieId);
    });
  });
});


afterAll(async () => {
  await new Promise(resolve => setTimeout(() => resolve(), 500)); 
  await app.shutdownService();
});
