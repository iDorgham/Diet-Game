/**
 * Social Recommendation Service
 * AI-powered recommendations for social features including friend suggestions,
 * team matching, content recommendations, and mentorship pairing
 */

const logger = require('../config/logger');
const db = require('../database/connection');

class SocialRecommendationService {
  constructor() {
    this.recommendationWeights = {
      mutualFriends: 0.3,
      commonInterests: 0.25,
      activityLevel: 0.2,
      location: 0.15,
      goals: 0.1
    };
  }

  /**
   * Get enhanced friend suggestions with AI scoring
   */
  async getEnhancedFriendSuggestions(userId, limit = 10) {
    try {
      const user = await this.getUserProfile(userId);
      const existingFriends = await this.getUserFriends(userId);
      const pendingRequests = await this.getPendingFriendRequests(userId);
      
      // Get potential friends with enhanced scoring
      const suggestions = await this.calculateFriendRecommendations(
        user, 
        existingFriends, 
        pendingRequests, 
        limit
      );

      return suggestions.map(suggestion => ({
        ...suggestion,
        confidence: this.calculateConfidenceScore(suggestion),
        reasoning: this.generateReasoningText(suggestion),
        aiScore: suggestion.totalScore
      }));
    } catch (error) {
      logger.error('Error getting enhanced friend suggestions:', error);
      throw error;
    }
  }

  /**
   * Get team formation recommendations
   */
  async getTeamRecommendations(userId, challengeType = null) {
    try {
      const user = await this.getUserProfile(userId);
      const userTeams = await this.getUserTeams(userId);
      const availableTeams = await this.getAvailableTeams(userId, challengeType);
      
      const recommendations = await this.calculateTeamRecommendations(
        user, 
        userTeams, 
        availableTeams
      );

      return recommendations.map(rec => ({
        ...rec,
        matchReason: this.generateTeamMatchReason(rec),
        aiScore: rec.totalScore,
        confidence: this.calculateTeamConfidence(rec)
      }));
    } catch (error) {
      logger.error('Error getting team recommendations:', error);
      throw error;
    }
  }

  /**
   * Get content recommendations for social feed
   */
  async getContentRecommendations(userId, limit = 20) {
    try {
      const user = await this.getUserProfile(userId);
      const userInterests = await this.getUserInterests(userId);
      const friends = await this.getUserFriends(userId);
      
      // Get posts from friends and similar users
      const recommendations = await this.calculateContentRecommendations(
        user, 
        userInterests, 
        friends, 
        limit
      );

      return recommendations.map(post => ({
        ...post,
        relevanceScore: post.totalScore,
        whyRecommended: this.generateContentReasoning(post),
        engagementPrediction: this.predictEngagement(post, user)
      }));
    } catch (error) {
      logger.error('Error getting content recommendations:', error);
      throw error;
    }
  }

  /**
   * Get mentorship matching recommendations
   */
  async getMentorshipRecommendations(userId, role = 'mentee') {
    try {
      const user = await this.getUserProfile(userId);
      const userGoals = await this.getUserGoals(userId);
      
      const recommendations = await this.calculateMentorshipRecommendations(
        user, 
        userGoals, 
        role
      );

      return recommendations.map(mentor => ({
        ...mentor,
        compatibilityScore: mentor.totalScore,
        matchReasons: this.generateMentorshipReasons(mentor),
        expectedOutcome: this.predictMentorshipOutcome(mentor, user)
      }));
    } catch (error) {
      logger.error('Error getting mentorship recommendations:', error);
      throw error;
    }
  }

  /**
   * Generate social insights for user
   */
  async generateSocialInsights(userId) {
    try {
      const user = await this.getUserProfile(userId);
      const socialActivity = await this.getUserSocialActivity(userId);
      const engagementMetrics = await this.calculateEngagementMetrics(userId);
      
      const insights = {
        engagementTrends: this.analyzeEngagementTrends(engagementMetrics),
        socialGrowth: this.analyzeSocialGrowth(socialActivity),
        contentPerformance: this.analyzeContentPerformance(userId),
        networkAnalysis: this.analyzeNetwork(userId),
        recommendations: this.generateInsightRecommendations(user, socialActivity)
      };

      return insights;
    } catch (error) {
      logger.error('Error generating social insights:', error);
      throw error;
    }
  }

  /**
   * Calculate friend recommendations with AI scoring
   */
  async calculateFriendRecommendations(user, existingFriends, pendingRequests, limit) {
    const query = `
      WITH user_interests AS (
        SELECT unnest($2::text[]) as interest
      ),
      potential_friends AS (
        SELECT 
          u.id,
          u.username,
          u.display_name,
          u.avatar_url,
          u.bio,
          u.location,
          u.activity_level,
          u.goals,
          u.interests,
          u.created_at,
          -- Mutual friends count
          COALESCE(mutual.mutual_count, 0) as mutual_friends,
          -- Common interests
          COALESCE(common.interests_count, 0) as common_interests,
          -- Location similarity (if both have location)
          CASE 
            WHEN u.location IS NOT NULL AND $3 IS NOT NULL 
            THEN 1.0 - (ST_Distance(u.location, $3::geography) / 100000.0)
            ELSE 0.0
          END as location_similarity,
          -- Activity level similarity
          CASE 
            WHEN u.activity_level = $4 THEN 1.0
            WHEN ABS(u.activity_level - $4) = 1 THEN 0.7
            WHEN ABS(u.activity_level - $4) = 2 THEN 0.4
            ELSE 0.1
          END as activity_similarity,
          -- Goals similarity
          COALESCE(goals.goals_similarity, 0) as goals_similarity,
          -- Recency boost
          CASE 
            WHEN u.created_at > NOW() - INTERVAL '7 days' THEN 0.2
            WHEN u.created_at > NOW() - INTERVAL '30 days' THEN 0.1
            ELSE 0.0
          END as recency_boost
        FROM users u
        LEFT JOIN (
          SELECT 
            CASE WHEN f1.user1_id = $1 THEN f1.user2_id ELSE f1.user1_id END as friend_id,
            COUNT(*) as mutual_count
          FROM friendships f1
          JOIN friendships f2 ON (
            (f1.user1_id = $1 AND f2.user1_id = $1) OR
            (f1.user2_id = $1 AND f2.user2_id = $1)
          )
          WHERE f1.user1_id = $1 OR f1.user2_id = $1
          GROUP BY friend_id
        ) mutual ON u.id = mutual.friend_id
        LEFT JOIN (
          SELECT 
            u2.id,
            COUNT(*) as interests_count
          FROM users u2
          CROSS JOIN user_interests ui
          WHERE u2.interests @> ARRAY[ui.interest]
          GROUP BY u2.id
        ) common ON u.id = common.id
        LEFT JOIN (
          SELECT 
            u3.id,
            array_length(array(
              SELECT unnest(u3.goals) INTERSECT SELECT unnest($5::text[])
            ), 1)::float / GREATEST(array_length($5::text[], 1), 1) as goals_similarity
          FROM users u3
        ) goals ON u.id = goals.id
        WHERE u.id != $1
        AND u.id NOT IN (${existingFriends.map(() => '?').join(',')})
        AND u.id NOT IN (${pendingRequests.map(() => '?').join(',')})
        AND u.is_active = true
      )
      SELECT 
        *,
        (
          mutual_friends * $6 +
          common_interests * $7 +
          location_similarity * $8 +
          activity_similarity * $9 +
          goals_similarity * $10 +
          recency_boost
        ) as total_score
      FROM potential_friends
      ORDER BY total_score DESC
      LIMIT $11
    `;

    const params = [
      user.id,
      user.interests || [],
      user.location,
      user.activity_level,
      user.goals || [],
      this.recommendationWeights.mutualFriends,
      this.recommendationWeights.commonInterests,
      this.recommendationWeights.location,
      this.recommendationWeights.activityLevel,
      this.recommendationWeights.goals,
      limit,
      ...existingFriends,
      ...pendingRequests
    ];

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Calculate team recommendations
   */
  async calculateTeamRecommendations(user, userTeams, availableTeams) {
    const query = `
      SELECT 
        t.*,
        tm.member_count,
        tc.challenge_count,
        -- Team compatibility score
        (
          CASE WHEN t.goals && $2 THEN 0.4 ELSE 0 END +
          CASE WHEN t.activity_level = $3 THEN 0.3 ELSE 0 END +
          CASE WHEN t.location IS NOT NULL AND $4 IS NOT NULL 
               THEN 0.2 * (1.0 - ST_Distance(t.location, $4::geography) / 100000.0)
               ELSE 0.1 END +
          CASE WHEN tm.member_count < t.max_members THEN 0.1 ELSE 0 END
        ) as total_score
      FROM teams t
      LEFT JOIN (
        SELECT team_id, COUNT(*) as member_count
        FROM team_members
        GROUP BY team_id
      ) tm ON t.id = tm.team_id
      LEFT JOIN (
        SELECT team_id, COUNT(*) as challenge_count
        FROM team_challenges
        WHERE status = 'active'
        GROUP BY team_id
      ) tc ON t.id = tc.team_id
      WHERE t.id NOT IN (${userTeams.map(() => '?').join(',')})
      AND t.privacy = 'public'
      AND t.is_active = true
      ORDER BY total_score DESC
      LIMIT 10
    `;

    const params = [
      user.id,
      user.goals || [],
      user.activity_level,
      user.location,
      ...userTeams
    ];

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Calculate content recommendations
   */
  async calculateContentRecommendations(user, userInterests, friends, limit) {
    const friendIds = friends.map(f => f.friend_id);
    
    const query = `
      WITH user_interests AS (
        SELECT unnest($2::text[]) as interest
      ),
      recommended_posts AS (
        SELECT 
          p.*,
          u.username,
          u.display_name,
          u.avatar_url,
          -- Interest relevance
          COALESCE(interest_relevance.score, 0) as interest_score,
          -- Friend connection
          CASE WHEN p.user_id = ANY($3::uuid[]) THEN 0.3 ELSE 0 END as friend_boost,
          -- Engagement prediction
          COALESCE(engagement.like_count, 0) * 0.1 + 
          COALESCE(engagement.comment_count, 0) * 0.2 as engagement_score,
          -- Recency
          CASE 
            WHEN p.created_at > NOW() - INTERVAL '1 hour' THEN 0.2
            WHEN p.created_at > NOW() - INTERVAL '1 day' THEN 0.1
            ELSE 0.05
          END as recency_score
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN (
          SELECT 
            p2.id,
            COUNT(*) * 0.1 as score
          FROM posts p2
          CROSS JOIN user_interests ui
          WHERE p2.tags @> ARRAY[ui.interest]
          GROUP BY p2.id
        ) interest_relevance ON p.id = interest_relevance.id
        LEFT JOIN (
          SELECT 
            post_id,
            COUNT(CASE WHEN type = 'like' THEN 1 END) as like_count,
            COUNT(CASE WHEN type = 'comment' THEN 1 END) as comment_count
          FROM post_likes
          GROUP BY post_id
        ) engagement ON p.id = engagement.post_id
        WHERE p.privacy IN ('public', 'friends')
        AND p.user_id != $1
        AND (p.privacy = 'public' OR p.user_id = ANY($3::uuid[]))
        AND p.created_at > NOW() - INTERVAL '7 days'
      )
      SELECT 
        *,
        (interest_score + friend_boost + engagement_score + recency_score) as total_score
      FROM recommended_posts
      ORDER BY total_score DESC
      LIMIT $4
    `;

    const result = await db.query(query, [
      user.id,
      userInterests,
      friendIds,
      limit
    ]);

    return result.rows;
  }

  /**
   * Calculate mentorship recommendations
   */
  async calculateMentorshipRecommendations(user, userGoals, role) {
    const query = `
      SELECT 
        mp.*,
        u.username,
        u.display_name,
        u.avatar_url,
        u.bio,
        u.experience_level,
        -- Goal alignment
        array_length(array(
          SELECT unnest(mp.specialties) INTERSECT SELECT unnest($2::text[])
        ), 1)::float / GREATEST(array_length($2::text[], 1), 1) as goal_alignment,
        -- Experience level match
        CASE 
          WHEN mp.experience_level = 'expert' AND $3 = 'beginner' THEN 1.0
          WHEN mp.experience_level = 'intermediate' AND $3 IN ('beginner', 'intermediate') THEN 0.8
          WHEN mp.experience_level = 'advanced' AND $3 IN ('beginner', 'intermediate', 'advanced') THEN 0.9
          ELSE 0.5
        END as experience_match,
        -- Availability
        CASE 
          WHEN mp.availability = 'high' THEN 0.2
          WHEN mp.availability = 'medium' THEN 0.1
          ELSE 0.05
        END as availability_score,
        -- Rating
        COALESCE(rating.avg_rating, 3.0) / 5.0 as rating_score
      FROM mentorship_profiles mp
      JOIN users u ON mp.user_id = u.id
      LEFT JOIN (
        SELECT 
          mentor_id,
          AVG(rating) as avg_rating
        FROM mentorship_sessions
        WHERE status = 'completed'
        GROUP BY mentor_id
      ) rating ON mp.user_id = rating.mentor_id
      WHERE mp.profile_type = 'mentor'
      AND mp.user_id != $1
      AND mp.is_active = true
    `;

    const result = await db.query(query, [
      user.id,
      userGoals,
      user.experience_level
    ]);

    return result.rows.map(row => ({
      ...row,
      totalScore: (
        row.goal_alignment * 0.4 +
        row.experience_match * 0.3 +
        row.availability_score +
        row.rating_score * 0.2
      )
    }));
  }

  /**
   * Generate social insights
   */
  async generateSocialInsights(userId) {
    const insights = await Promise.all([
      this.analyzeEngagementTrends(userId),
      this.analyzeSocialGrowth(userId),
      this.analyzeContentPerformance(userId),
      this.analyzeNetwork(userId)
    ]);

    return {
      engagementTrends: insights[0],
      socialGrowth: insights[1],
      contentPerformance: insights[2],
      networkAnalysis: insights[3],
      generatedAt: new Date().toISOString()
    };
  }

  // Helper methods
  async getUserProfile(userId) {
    const query = `
      SELECT u.*, up.*
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  async getUserFriends(userId) {
    const query = `
      SELECT CASE WHEN user1_id = $1 THEN user2_id ELSE user1_id END as friend_id
      FROM friendships
      WHERE user1_id = $1 OR user2_id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows.map(row => row.friend_id);
  }

  async getPendingFriendRequests(userId) {
    const query = `
      SELECT CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END as user_id
      FROM friend_requests
      WHERE (sender_id = $1 OR receiver_id = $1) AND status = 'pending'
    `;
    const result = await db.query(query, [userId]);
    return result.rows.map(row => row.user_id);
  }

  async getUserTeams(userId) {
    const query = `
      SELECT team_id
      FROM team_members
      WHERE user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows.map(row => row.team_id);
  }

  async getAvailableTeams(userId, challengeType) {
    const query = `
      SELECT t.*
      FROM teams t
      WHERE t.privacy = 'public'
      AND t.is_active = true
      AND t.id NOT IN (
        SELECT team_id FROM team_members WHERE user_id = $1
      )
      ${challengeType ? 'AND t.challenge_type = $2' : ''}
    `;
    const params = challengeType ? [userId, challengeType] : [userId];
    const result = await db.query(query, params);
    return result.rows;
  }

  async getUserInterests(userId) {
    const query = `
      SELECT interests
      FROM users
      WHERE id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0]?.interests || [];
  }

  async getUserGoals(userId) {
    const query = `
      SELECT goals
      FROM users
      WHERE id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0]?.goals || [];
  }

  async getUserSocialActivity(userId) {
    const query = `
      SELECT 
        COUNT(CASE WHEN type = 'post' THEN 1 END) as posts_count,
        COUNT(CASE WHEN type = 'like' THEN 1 END) as likes_count,
        COUNT(CASE WHEN type = 'comment' THEN 1 END) as comments_count,
        COUNT(CASE WHEN type = 'friend_request' THEN 1 END) as friend_requests_count
      FROM user_activities
      WHERE user_id = $1
      AND created_at > NOW() - INTERVAL '30 days'
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  async calculateEngagementMetrics(userId) {
    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as activity_count,
        COUNT(CASE WHEN type = 'post' THEN 1 END) as posts,
        COUNT(CASE WHEN type = 'like' THEN 1 END) as likes,
        COUNT(CASE WHEN type = 'comment' THEN 1 END) as comments
      FROM user_activities
      WHERE user_id = $1
      AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  // AI scoring and reasoning methods
  calculateConfidenceScore(suggestion) {
    const baseScore = suggestion.totalScore;
    const mutualFriendsBonus = Math.min(suggestion.mutual_friends * 0.1, 0.3);
    const interestsBonus = Math.min(suggestion.common_interests * 0.05, 0.2);
    
    return Math.min(baseScore + mutualFriendsBonus + interestsBonus, 1.0);
  }

  generateReasoningText(suggestion) {
    const reasons = [];
    
    if (suggestion.mutual_friends > 0) {
      reasons.push(`${suggestion.mutual_friends} mutual friends`);
    }
    
    if (suggestion.common_interests > 0) {
      reasons.push(`${suggestion.common_interests} common interests`);
    }
    
    if (suggestion.location_similarity > 0.7) {
      reasons.push('Nearby location');
    }
    
    if (suggestion.activity_similarity > 0.8) {
      reasons.push('Similar activity level');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Suggested for you';
  }

  generateTeamMatchReason(rec) {
    const reasons = [];
    
    if (rec.goals && rec.goals.length > 0) {
      reasons.push('Shared goals');
    }
    
    if (rec.activity_level === rec.activity_level) {
      reasons.push('Matching activity level');
    }
    
    if (rec.member_count < rec.max_members) {
      reasons.push('Has available spots');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Good team match';
  }

  calculateTeamConfidence(rec) {
    return Math.min(rec.totalScore * 1.2, 1.0);
  }

  generateContentReasoning(post) {
    const reasons = [];
    
    if (post.interest_score > 0.1) {
      reasons.push('Matches your interests');
    }
    
    if (post.friend_boost > 0) {
      reasons.push('From a friend');
    }
    
    if (post.engagement_score > 0.5) {
      reasons.push('High engagement');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Popular content';
  }

  predictEngagement(post, user) {
    const baseEngagement = post.engagement_score || 0;
    const userEngagementHistory = 0.5; // This would come from user's historical data
    
    return Math.min(baseEngagement + userEngagementHistory, 1.0);
  }

  generateMentorshipReasons(mentor) {
    const reasons = [];
    
    if (mentor.goal_alignment > 0.5) {
      reasons.push('Aligned goals');
    }
    
    if (mentor.experience_match > 0.8) {
      reasons.push('Right experience level');
    }
    
    if (mentor.rating_score > 0.8) {
      reasons.push('Highly rated');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Good mentor match';
  }

  predictMentorshipOutcome(mentor, user) {
    const compatibility = mentor.totalScore;
    const experienceMatch = mentor.experience_match;
    const rating = mentor.rating_score;
    
    return Math.min((compatibility + experienceMatch + rating) / 3, 1.0);
  }

  async analyzeEngagementTrends(userId) {
    const metrics = await this.calculateEngagementMetrics(userId);
    
    if (metrics.length < 2) {
      return { trend: 'insufficient_data', message: 'Need more activity data' };
    }
    
    const recent = metrics.slice(0, 7);
    const previous = metrics.slice(7, 14);
    
    const recentAvg = recent.reduce((sum, day) => sum + day.activity_count, 0) / recent.length;
    const previousAvg = previous.reduce((sum, day) => sum + day.activity_count, 0) / previous.length;
    
    const change = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    return {
      trend: change > 10 ? 'increasing' : change < -10 ? 'decreasing' : 'stable',
      change: Math.round(change),
      recentAverage: Math.round(recentAvg),
      message: this.generateEngagementMessage(change)
    };
  }

  async analyzeSocialGrowth(userId) {
    const query = `
      SELECT 
        COUNT(DISTINCT f.id) as total_friends,
        COUNT(DISTINCT CASE WHEN f.created_at > NOW() - INTERVAL '30 days' THEN f.id END) as new_friends_30d,
        COUNT(DISTINCT CASE WHEN f.created_at > NOW() - INTERVAL '7 days' THEN f.id END) as new_friends_7d
      FROM friendships f
      WHERE f.user1_id = $1 OR f.user2_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    const data = result.rows[0];
    
    return {
      totalFriends: data.total_friends,
      newFriends30d: data.new_friends_30d,
      newFriends7d: data.new_friends_7d,
      growthRate: data.total_friends > 0 ? (data.new_friends_30d / data.total_friends) * 100 : 0,
      message: this.generateGrowthMessage(data)
    };
  }

  async analyzeContentPerformance(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_posts,
        AVG(like_count) as avg_likes,
        AVG(comment_count) as avg_comments,
        MAX(like_count) as max_likes,
        MAX(comment_count) as max_comments
      FROM (
        SELECT 
          p.id,
          COUNT(pl.id) as like_count,
          COUNT(pc.id) as comment_count
        FROM posts p
        LEFT JOIN post_likes pl ON p.id = pl.post_id
        LEFT JOIN post_comments pc ON p.id = pc.post_id
        WHERE p.user_id = $1
        AND p.created_at > NOW() - INTERVAL '30 days'
        GROUP BY p.id
      ) post_stats
    `;
    
    const result = await db.query(query, [userId]);
    const data = result.rows[0];
    
    return {
      totalPosts: data.total_posts,
      averageLikes: Math.round(data.avg_likes || 0),
      averageComments: Math.round(data.avg_comments || 0),
      bestPostLikes: data.max_likes || 0,
      bestPostComments: data.max_comments || 0,
      engagementScore: this.calculateEngagementScore(data),
      message: this.generateContentMessage(data)
    };
  }

  async analyzeNetwork(userId) {
    const query = `
      WITH user_network AS (
        SELECT 
          u.id,
          u.username,
          u.display_name,
          COUNT(DISTINCT f2.id) as friend_count,
          COUNT(DISTINCT p.id) as post_count,
          COUNT(DISTINCT pl.id) as like_count
        FROM users u
        LEFT JOIN friendships f1 ON (f1.user1_id = u.id OR f1.user2_id = u.id)
        LEFT JOIN friendships f2 ON (
          (f2.user1_id = u.id OR f2.user2_id = u.id) AND
          (f2.user1_id != $1 AND f2.user2_id != $1)
        )
        LEFT JOIN posts p ON p.user_id = u.id
        LEFT JOIN post_likes pl ON pl.user_id = u.id
        WHERE u.id IN (
          SELECT CASE WHEN user1_id = $1 THEN user2_id ELSE user1_id END
          FROM friendships
          WHERE user1_id = $1 OR user2_id = $1
        )
        GROUP BY u.id, u.username, u.display_name
      )
      SELECT 
        COUNT(*) as network_size,
        AVG(friend_count) as avg_friends_per_connection,
        AVG(post_count) as avg_posts_per_connection,
        AVG(like_count) as avg_likes_per_connection
      FROM user_network
    `;
    
    const result = await db.query(query, [userId]);
    const data = result.rows[0];
    
    return {
      networkSize: data.network_size,
      averageFriendsPerConnection: Math.round(data.avg_friends_per_connection || 0),
      averagePostsPerConnection: Math.round(data.avg_posts_per_connection || 0),
      averageLikesPerConnection: Math.round(data.avg_likes_per_connection || 0),
      networkDensity: this.calculateNetworkDensity(data),
      message: this.generateNetworkMessage(data)
    };
  }

  generateInsightRecommendations(user, socialActivity) {
    const recommendations = [];
    
    if (socialActivity.posts_count < 5) {
      recommendations.push({
        type: 'content',
        priority: 'high',
        message: 'Try posting more content to increase engagement',
        action: 'Create your first post'
      });
    }
    
    if (socialActivity.friend_requests_count < 3) {
      recommendations.push({
        type: 'social',
        priority: 'medium',
        message: 'Connect with more people to expand your network',
        action: 'Send friend requests'
      });
    }
    
    if (socialActivity.likes_count < 10) {
      recommendations.push({
        type: 'engagement',
        priority: 'medium',
        message: 'Engage more with others\' content',
        action: 'Like and comment on posts'
      });
    }
    
    return recommendations;
  }

  // Message generation helpers
  generateEngagementMessage(change) {
    if (change > 20) return 'Your engagement is growing rapidly!';
    if (change > 10) return 'Your engagement is increasing nicely.';
    if (change > -10) return 'Your engagement is stable.';
    if (change > -20) return 'Your engagement has decreased slightly.';
    return 'Your engagement has decreased significantly.';
  }

  generateGrowthMessage(data) {
    if (data.new_friends_7d > 0) {
      return `You've added ${data.new_friends_7d} new friends this week!`;
    }
    if (data.new_friends_30d > 0) {
      return `You've added ${data.new_friends_30d} new friends this month.`;
    }
    return 'Consider connecting with more people to grow your network.';
  }

  generateContentMessage(data) {
    if (data.total_posts === 0) {
      return 'Start sharing content to engage with your network.';
    }
    if (data.avg_likes > 5) {
      return 'Your content is getting good engagement!';
    }
    return 'Try posting more engaging content to increase interactions.';
  }

  generateNetworkMessage(data) {
    if (data.network_size < 5) {
      return 'Your network is small. Consider connecting with more people.';
    }
    if (data.network_size > 20) {
      return 'You have a strong network! Keep nurturing these connections.';
    }
    return 'Your network is growing well. Keep building connections.';
  }

  calculateEngagementScore(data) {
    const totalEngagement = (data.avg_likes || 0) + (data.avg_comments || 0) * 2;
    return Math.min(totalEngagement / 10, 1.0);
  }

  calculateNetworkDensity(data) {
    if (data.network_size === 0) return 0;
    const maxPossibleConnections = (data.network_size * (data.network_size - 1)) / 2;
    const actualConnections = data.avg_friends_per_connection * data.network_size / 2;
    return Math.min(actualConnections / maxPossibleConnections, 1.0);
  }
}

module.exports = new SocialRecommendationService();
