const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Idea Refiner Methods
  async structureIdea(rawInput, context, tone = 'persuasive') {
    try {
      const systemPrompt = this.getIdeaStructuringPrompt(context, tone);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: rawInput }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const structuredContent = this.parseStructuredResponse(completion.choices[0].message.content);
      return structuredContent;
    } catch (error) {
      console.error('Error structuring idea:', error);
      throw new Error('Failed to structure idea with AI');
    }
  }

  async generatePitchScript(structuredContent, context) {
    try {
      const systemPrompt = this.getPitchScriptPrompt(context);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(structuredContent) }
        ],
        temperature: 0.8,
        max_tokens: 1500
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating pitch script:', error);
      throw new Error('Failed to generate pitch script');
    }
  }

  async generateSummary(structuredContent) {
    try {
      const systemPrompt = `Create a concise one-page summary based on the structured idea content.

The summary should:
- Be 2-3 paragraphs maximum
- Highlight the key problem and solution
- Include the target audience and value proposition
- Be professional and compelling
- Suitable for sharing or printing

Format as clean, readable text without bullet points.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(structuredContent) }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary');
    }
  }

  async generateSlideContent(structuredContent, context) {
    try {
      const systemPrompt = this.getSlideContentPrompt(context);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(structuredContent) }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const slideContent = this.parseSlideContent(completion.choices[0].message.content);
      return slideContent;
    } catch (error) {
      console.error('Error generating slide content:', error);
      throw new Error('Failed to generate slide content');
    }
  }

  async evaluateIdea(structuredContent) {
    try {
      const systemPrompt = this.getIdeaEvaluationPrompt();
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(structuredContent) }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const evaluation = this.parseEvaluationResponse(completion.choices[0].message.content);
      return evaluation;
    } catch (error) {
      console.error('Error evaluating idea:', error);
      throw new Error('Failed to evaluate idea');
    }
  }

  // Interview Simulator Methods
  async generateInterviewQuestions(configuration) {
    try {
      const { role, company, experienceLevel, questionTypes, duration } = configuration;
      const systemPrompt = this.getQuestionGenerationPrompt(role, company, experienceLevel, questionTypes, duration);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate interview questions for ${role} at ${company || 'a company'}` }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const questions = this.parseQuestionsResponse(completion.choices[0].message.content);
      return questions;
    } catch (error) {
      console.error('Error generating interview questions:', error);
      throw new Error('Failed to generate interview questions');
    }
  }

  async generateInterviewFeedback(questions, responses, configuration) {
    try {
      const systemPrompt = this.getInterviewFeedbackPrompt();
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Questions: ${JSON.stringify(questions)}\n\nResponses: ${JSON.stringify(responses)}\n\nConfiguration: ${JSON.stringify(configuration)}` }
        ],
        temperature: 0.5,
        max_tokens: 2000
      });

      const feedback = this.parseFeedbackResponse(completion.choices[0].message.content);
      return feedback;
    } catch (error) {
      console.error('Error generating interview feedback:', error);
      throw new Error('Failed to generate interview feedback');
    }
  }

  async generateInterviewQuestionsOld(role, company, experienceLevel, questionTypes, duration) {
    try {
      const systemPrompt = this.getQuestionGenerationPrompt(role, company, experienceLevel, questionTypes, duration);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate interview questions for ${role} at ${company || 'a company'}` }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const questions = this.parseQuestionsResponse(completion.choices[0].message.content);
      return questions;
    } catch (error) {
      console.error('Error generating interview questions:', error);
      throw new Error('Failed to generate interview questions');
    }
  }

  async analyzeInterviewResponse(question, response, expectedKeywords = []) {
    try {
      const systemPrompt = this.getResponseAnalysisPrompt();
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Question: ${question}\n\nResponse: ${response}\n\nExpected Keywords: ${expectedKeywords.join(', ')}` }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const analysis = this.parseResponseAnalysis(completion.choices[0].message.content);
      return analysis;
    } catch (error) {
      console.error('Error analyzing interview response:', error);
      throw new Error('Failed to analyze interview response');
    }
  }

  async generateInterviewFeedback(interviewData, responses, performance) {
    try {
      const systemPrompt = this.getInterviewFeedbackPrompt();
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Interview Data: ${JSON.stringify(interviewData)}\n\nResponses: ${JSON.stringify(responses)}\n\nPerformance: ${JSON.stringify(performance)}` }
        ],
        temperature: 0.5,
        max_tokens: 2000
      });

      const feedback = this.parseFeedbackResponse(completion.choices[0].message.content);
      return feedback;
    } catch (error) {
      console.error('Error generating interview feedback:', error);
      throw new Error('Failed to generate interview feedback');
    }
  }

  // Prompt Generation Methods
  getIdeaStructuringPrompt(context, tone) {
    const contextPrompts = {
      hackathon: "You are structuring an idea for a hackathon pitch. Focus on innovation, technical feasibility, and impact.",
      startup: "You are structuring an idea for a startup investor pitch. Focus on market opportunity, scalability, and business model.",
      presentation: "You are structuring an idea for a class presentation. Focus on clarity, educational value, and engagement.",
      innovation: "You are structuring an idea for an innovation challenge. Focus on creativity, uniqueness, and potential impact."
    };

    return `${contextPrompts[context] || contextPrompts.startup}

Transform the raw idea into a structured format with these components:
1. Problem Statement - What specific problem does this solve?
2. Solution - What is the proposed solution/product?
3. Target Audience - Who are the primary users/beneficiaries?
4. Value Proposition - What makes this unique and valuable?
5. Market Fit - Why is this relevant now? What market need does it address?
6. Execution Plan - How would this be implemented? (optional)
7. Call to Action - How to engage judges/investors/audience?

Tone: ${tone}
Format: Return as JSON with the above keys and clear, concise content for each section.`;
  }

  getPitchScriptPrompt(context) {
    const timeLimits = {
      hackathon: "2-3 minutes",
      startup: "5-10 minutes", 
      presentation: "5-7 minutes",
      innovation: "3-5 minutes"
    };

    return `Create a compelling pitch script based on the structured content provided. 

Context: ${context}
Target duration: ${timeLimits[context] || "5 minutes"}

The script should:
- Start with a hook that grabs attention
- Clearly articulate the problem and solution
- Include a compelling story or use case
- Highlight the unique value proposition
- End with a strong call to action
- Be conversational and engaging
- Include natural speaking cues and pauses

Format as a readable script with clear sections and speaking notes.`;
  }

  getSlideContentPrompt(context) {
    return `Create slide content based on the structured idea. Generate 6-10 slides that tell a compelling story:

1. Title Slide - Idea name and tagline
2. Problem Slide - The challenge being addressed
3. Solution Slide - Your proposed solution
4. Market Opportunity - Size and potential
5. Competitive Advantage - What makes you unique
6. Business Model - How it works (for business ideas)
7. Team/Implementation - Who/how it gets done
8. Impact/Vision - The future you're building
9. Call to Action - Next steps

Each slide should have:
- A clear, compelling title
- 3-5 bullet points maximum
- Speaker notes for presentation
- Visual suggestions where appropriate

Format as JSON array with title, content, and notes for each slide.`;
  }

  getIdeaEvaluationPrompt() {
    return `Evaluate the structured idea on these criteria (1-10 scale):

1. Clarity - How clear and understandable is the idea?
2. Persuasiveness - How convincing is the value proposition?
3. Creativity - How unique and innovative is the solution?
4. Market Potential - How viable is the market opportunity?
5. Feasibility - How realistic is the execution plan?

For each criterion:
- Provide a score (1-10)
- Give 2-3 specific suggestions for improvement
- Identify key strengths

Also provide:
- Overall score and summary
- Top 3 strengths
- Top 3 areas for improvement
- Specific actionable recommendations

Format as JSON with scores, feedback, and suggestions.`;
  }

  getQuestionGenerationPrompt(role, company, experienceLevel, questionTypes, duration) {
    const questionCount = Math.floor(duration / 5); // ~5 minutes per question

    return `Generate ${questionCount} interview questions for a ${experienceLevel}-level ${role} position${company ? ` at ${company}` : ''}.

Question types to include: ${questionTypes.join(', ')}

For each question:
- Provide the question text
- Specify the question type
- Indicate difficulty level (easy/medium/hard)
- Include expected keywords/topics
- Add evaluation criteria
- Suggest follow-up questions

Ensure questions are:
- Relevant to the role and experience level
- Industry-appropriate
- Mix of behavioral, technical, and situational
- Progressive in difficulty
- Realistic for the time frame

Format as JSON array with all question details.`;
  }

  getResponseAnalysisPrompt() {
    return `Analyze the interview response on these dimensions:

1. Relevance (1-10) - How well does it address the question?
2. Clarity (1-10) - How clear and well-structured is the response?
3. Completeness (1-10) - How thorough is the answer?
4. Confidence (1-10) - How confident and assured does the response sound?

For each dimension:
- Provide a numerical score
- Give specific feedback
- Suggest improvements

Overall assessment:
- Highlight strengths
- Identify weaknesses
- Provide specific recommendations
- Suggest follow-up questions if needed

Format as JSON with scores, feedback, and recommendations.`;
  }

  getInterviewFeedbackPrompt() {
    return `Provide comprehensive interview feedback based on the performance data.

Structure your feedback as:
1. Overall Performance Summary
2. Strengths (3-5 key areas)
3. Areas for Improvement (3-5 specific areas)
4. Detailed Analysis by Category:
   - Communication Skills
   - Technical Knowledge
   - Problem-Solving Ability
   - Industry Knowledge
5. Specific Recommendations
6. Practice Suggestions
7. Next Steps

Make the feedback:
- Constructive and actionable
- Specific with examples
- Encouraging but honest
- Focused on improvement
- Professional in tone

Format as a well-structured feedback report.`;
  }

  // Response Parsing Methods
  parseStructuredResponse(content) {
    try {
      // Try to parse as JSON first
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback to text parsing
      return this.parseTextToStructured(content);
    } catch (error) {
      console.error('Error parsing structured response:', error);
      return this.parseTextToStructured(content);
    }
  }

  parseTextToStructured(content) {
    const sections = {
      problemStatement: this.extractSection(content, ['problem', 'challenge', 'issue']),
      solution: this.extractSection(content, ['solution', 'approach', 'product']),
      targetAudience: this.extractSection(content, ['audience', 'users', 'customers', 'target']),
      valueProposition: this.extractSection(content, ['value', 'unique', 'proposition', 'advantage']),
      marketFit: this.extractSection(content, ['market', 'fit', 'opportunity', 'timing']),
      executionPlan: this.extractSection(content, ['execution', 'implementation', 'plan', 'roadmap']),
      callToAction: this.extractSection(content, ['action', 'next', 'call'])
    };

    return sections;
  }

  extractSection(text, keywords) {
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (keywords.some(keyword => line.includes(keyword))) {
        // Return the next few lines as the content
        return lines.slice(i, i + 3).join(' ').trim();
      }
    }
    return '';
  }

  parseSlideContent(content) {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback to text parsing
      return this.parseTextToSlides(content);
    } catch (error) {
      console.error('Error parsing slide content:', error);
      return this.parseTextToSlides(content);
    }
  }

  parseTextToSlides(content) {
    const slides = [];
    const sections = content.split(/\d+\./);
    
    sections.forEach((section, index) => {
      if (section.trim()) {
        const lines = section.trim().split('\n');
        slides.push({
          slideNumber: index,
          title: lines[0] || `Slide ${index}`,
          content: lines.slice(1).join('\n'),
          notes: ''
        });
      }
    });

    return slides;
  }

  parseEvaluationResponse(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.parseTextToEvaluation(content);
    } catch (error) {
      console.error('Error parsing evaluation response:', error);
      return this.parseTextToEvaluation(content);
    }
  }

  parseTextToEvaluation(content) {
    return {
      clarity: { score: 7, suggestions: ['Improve clarity'] },
      persuasiveness: { score: 7, suggestions: ['Enhance persuasiveness'] },
      creativity: { score: 7, suggestions: ['Increase creativity'] },
      overallScore: 7,
      improvementSuggestions: ['General improvements needed'],
      strengths: ['Good foundation']
    };
  }

  parseQuestionsResponse(content) {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.parseTextToQuestions(content);
    } catch (error) {
      console.error('Error parsing questions response:', error);
      return this.parseTextToQuestions(content);
    }
  }

  parseTextToQuestions(content) {
    const questions = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.trim() && (line.includes('?') || line.match(/^\d+\./))) {
        questions.push({
          questionText: line.replace(/^\d+\.\s*/, '').trim(),
          questionType: 'general',
          difficulty: 'medium',
          expectedKeywords: [],
          category: 'general'
        });
      }
    });

    return questions.slice(0, 10); // Limit to 10 questions
  }

  parseResponseAnalysis(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        relevance: { score: 7, feedback: 'Good relevance' },
        clarity: { score: 7, feedback: 'Clear response' },
        completeness: { score: 7, feedback: 'Complete answer' },
        confidence: { score: 7, feedback: 'Confident delivery' }
      };
    } catch (error) {
      console.error('Error parsing response analysis:', error);
      return {
        relevance: { score: 7, feedback: 'Good relevance' },
        clarity: { score: 7, feedback: 'Clear response' },
        completeness: { score: 7, feedback: 'Complete answer' },
        confidence: { score: 7, feedback: 'Confident delivery' }
      };
    }
  }

  parseFeedbackResponse(content) {
    return {
      overallScore: 75,
      aiFeedback: content,
      detailedAnalysis: {
        communicationSkills: 'Good communication skills demonstrated',
        technicalKnowledge: 'Solid technical foundation',
        problemSolvingAbility: 'Effective problem-solving approach',
        industryKnowledge: 'Good industry awareness'
      },
      mockInterviewer: {
        name: 'AI Interview Coach',
        personality: 'Supportive and constructive',
        feedbackStyle: 'Detailed and actionable'
      },
      strengths: ['Clear communication', 'Good technical knowledge'],
      improvements: ['Practice more examples', 'Work on confidence'],
      recommendations: ['Continue practicing', 'Focus on specific areas']
    };
  }
}

module.exports = new AIService();
