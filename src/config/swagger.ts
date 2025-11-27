import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Physical Asia Game API',
      version: '1.0.0',
      description: 'Physical Asia Game Backend API Documentation',
      contact: {
        name: 'API Support',
        email: 'support@physicalasia.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server'
      },
      {
        url: 'https://api.physicalasia.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token (without "Bearer" prefix)'
        }
      },
      schemas: {
        Player: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            avatar: {
              type: 'object',
              properties: {
                imageUrl: { type: 'string' },
                frameId: { type: 'string' }
              }
            },
            level: { type: 'number' },
            xp: { type: 'number' },
            totalPoints: { type: 'number' },
            rank: { type: 'number' },
            gamesPlayed: { type: 'number' },
            wins: { type: 'number' },
            losses: { type: 'number' },
            draws: { type: 'number' },
            coins: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        PlayerStats: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            playerId: { type: 'string' },
            gameType: { type: 'string' },
            gamesPlayed: { type: 'number' },
            wins: { type: 'number' },
            losses: { type: 'number' },
            draws: { type: 'number' },
            totalScore: { type: 'number' },
            averageScore: { type: 'number' },
            bestScore: { type: 'number' },
            winRate: { type: 'number' },
            currentStreak: { type: 'number' },
            longestStreak: { type: 'number' },
            lastPlayedAt: { type: 'string', format: 'date-time' }
          }
        },
        GameSession: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            gameType: { type: 'string', enum: ['running', 'jumping', 'throwing', 'balance', 'endurance'] },
            mode: { type: 'string', enum: ['1v1', 'battle-royale', 'tournament'] },
            seasonId: { type: 'string' },
            players: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  playerId: { type: 'string' },
                  username: { type: 'string' },
                  avatar: { type: 'string' }
                }
              }
            },
            status: { type: 'string', enum: ['waiting', 'countdown', 'active', 'finished', 'cancelled'] },
            startedAt: { type: 'string', format: 'date-time' },
            endedAt: { type: 'string', format: 'date-time' },
            winnerId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        GameResult: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            sessionId: { type: 'string' },
            playerId: { type: 'string' },
            gameType: { type: 'string' },
            score: { type: 'number' },
            rank: { type: 'number' },
            pointsEarned: { type: 'number' },
            xpEarned: { type: 'number' },
            stats: { type: 'object' },
            rewards: {
              type: 'object',
              properties: {
                coins: { type: 'number' },
                seasonPassXp: { type: 'number' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        LeaderboardEntry: {
          type: 'object',
          properties: {
            playerId: { type: 'string' },
            username: { type: 'string' },
            avatar: { type: 'string' },
            points: { type: 'number' },
            rank: { type: 'number' }
          }
        },
        Tournament: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            gameType: { type: 'string' },
            seasonId: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            registrationDeadline: { type: 'string', format: 'date-time' },
            maxParticipants: { type: 'number' },
            status: { type: 'string', enum: ['upcoming', 'registration', 'active', 'finished', 'cancelled'] },
            participants: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  playerId: { type: 'string' },
                  registeredAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            bracket: { type: 'object' },
            rewards: {
              type: 'object',
              properties: {
                first: {
                  type: 'object',
                  properties: {
                    coins: { type: 'number' },
                    xp: { type: 'number' }
                  }
                },
                second: {
                  type: 'object',
                  properties: {
                    coins: { type: 'number' },
                    xp: { type: 'number' }
                  }
                },
                third: {
                  type: 'object',
                  properties: {
                    coins: { type: 'number' },
                    xp: { type: 'number' }
                  }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Challenge: {
          type: 'object',
          properties: {
            challengeId: { type: 'string' },
            type: { type: 'string', enum: ['play_games', 'win_games', 'score_points', 'streak', 'special'] },
            gameType: { type: 'string', enum: ['running', 'jumping', 'throwing', 'balance', 'endurance'] },
            title: { type: 'string' },
            description: { type: 'string' },
            requirement: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                value: { type: 'number' }
              }
            },
            reward: {
              type: 'object',
              properties: {
                coins: { type: 'number' },
                xp: { type: 'number' }
              }
            },
            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] }
          }
        },
        ChallengeProgress: {
          type: 'object',
          allOf: [
            { $ref: '#/components/schemas/Challenge' },
            {
              type: 'object',
              properties: {
                progress: { type: 'number' },
                completed: { type: 'boolean' },
                claimed: { type: 'boolean' }
              }
            }
          ]
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string' }
          }
        }
      }
    },
  },
  apis: ['./src/routes/*.ts', './src/server.ts']
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Physical Asia Game API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      requestInterceptor: (req: any) => {
        // Fix token format - remove extra spaces
        if (req.headers && req.headers.Authorization) {
          req.headers.Authorization = req.headers.Authorization.replace(/\s+/g, ' ').trim();
        }
        return req;
      }
    }
  }));

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(swaggerSpec);
  });
}

