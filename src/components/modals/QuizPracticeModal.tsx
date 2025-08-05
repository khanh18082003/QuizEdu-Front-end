import { useState, useEffect, useRef } from "react";
import { FaTimes, FaCheck, FaChevronLeft, FaChevronRight, FaClock, FaQuestionCircle, FaTrophy, FaStar, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import Button from "../ui/Button";
import type { QuizManagementItem, MultipleChoiceQuestion, MatchingQuestion } from "../../services/quizService";
import type { RegisterResponse } from "../../services/userService";

interface Answer {
  answer_text: string;
  correct: boolean;
}

interface UserAnswer {
  questionId: string;
  type: 'multiple_choice' | 'matching';
  selectedAnswers?: string[];
  matchingPairs?: { itemA: string; itemB: string }[];
}

interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  userAnswer: UserAnswer;
  correctAnswer: any;
}

interface QuizPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizManagementItem | null;
  selectedStudent?: RegisterResponse | null;
}

const QuizPracticeModal = ({ isOpen, onClose, quiz, selectedStudent }: QuizPracticeModalProps) => {
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [allQuestions, setAllQuestions] = useState<(MultipleChoiceQuestion | MatchingQuestion | any)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  // Matching states
  const [selectedMatchingItems, setSelectedMatchingItems] = useState<{[key: string]: boolean}>({});
  const [matchingPairs, setMatchingPairs] = useState<{itemA: string, itemB: string}[]>([]);
  const [groupedMatchingQuestions, setGroupedMatchingQuestions] = useState<Record<string, any[]>>({});
  const [shuffledGroupedQuestions, setShuffledGroupedQuestions] = useState<Record<string, {columnA: any[], columnB: any[]}>>({});

  // Audio states
  const [isMuted, setIsMuted] = useState(false);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);
  const tickingSoundRef = useRef<HTMLAudioElement | null>(null);

  // State for matching timer continuity
  const [matchingTimerStarted, setMatchingTimerStarted] = useState(false);
  const [initialMatchingTime, setInitialMatchingTime] = useState(0);
  
  // Animation states
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false); 
  const [showIncorrectAnimation, setShowIncorrectAnimation] = useState(false);

  useEffect(() => {
    if (quiz && isOpen) {
      const questions: (MultipleChoiceQuestion | MatchingQuestion | any)[] = [];
      
      // Add multiple choice questions with shuffled order and answers
      if (quiz.multiple_choice_quiz?.questions) {
        const shuffledMCQuestions = [...quiz.multiple_choice_quiz.questions]
          .sort(() => Math.random() - 0.5) // Shuffle question order
          .map(q => ({
            ...q,
            type: 'multiple_choice' as const,
            answers: [...q.answers].sort(() => Math.random() - 0.5) // Shuffle answer order
          }));
        questions.push(...shuffledMCQuestions);
      }
      
      // Add matching as separate questions by type
      if (quiz.matching_quiz?.questions && quiz.matching_quiz.questions.length > 0) {
        // Group questions by type combination
        const grouped = quiz.matching_quiz.questions.reduce((groups, question, index) => {
          const typeKey = `${question.item_a.matching_type}-${question.item_b.matching_type}`;
          if (!groups[typeKey]) {
            groups[typeKey] = [];
          }
          groups[typeKey].push({ ...question, originalIndex: index });
          return groups;
        }, {} as Record<string, Array<any>>);

        setGroupedMatchingQuestions(grouped);

        // Create shuffled versions for each group that has questions
        const shuffledGroups: Record<string, {columnA: any[], columnB: any[]}> = {};
        
        Object.keys(grouped).forEach(typeKey => {
          const questions = grouped[typeKey];
          
          // Create column A and B items for this group
          const columnAItems = questions.map((q, idx) => ({
            id: q.id,
            content: q.item_a.content,
            type: q.item_a.matching_type,
            originalQuestionId: q.id,
            uniqueKey: `${q.id}-A-${idx}` // Add unique key
          }));
          
          const columnBItems = questions.map((q, idx) => ({
            id: q.id,
            content: q.item_b.content,
            type: q.item_b.matching_type,
            originalQuestionId: q.id,
            uniqueKey: `${q.id}-B-${idx}` // Add unique key
          }));
          
          // Shuffle both columns independently for this group
          const shuffledColumnA = [...columnAItems].sort(() => Math.random() - 0.5);
          const shuffledColumnB = [...columnBItems].sort(() => Math.random() - 0.5);
          
          shuffledGroups[typeKey] = {
            columnA: shuffledColumnA,
            columnB: shuffledColumnB
          };
        });

        setShuffledGroupedQuestions(shuffledGroups);

        // Add introduction question for matching
        const matchingIntro = {
          id: 'matching-intro',
          type: 'matching_intro' as const,
          points: 0,
          totalQuestions: quiz.matching_quiz.questions.length,
          totalTime: quiz.matching_quiz.time_limit || 300,
          groupCount: Object.keys(grouped).length
        };
        questions.push(matchingIntro);

        // Add individual matching questions for each type that has questions
        Object.keys(grouped).forEach(typeKey => {
          const typeQuestions = grouped[typeKey];
          if (typeQuestions.length > 0) {
            const matchingQuestion = {
              id: `matching-${typeKey}`,
              type: 'matching' as const,
              typeKey: typeKey,
              questions: typeQuestions,
              points: typeQuestions.reduce((total, q) => total + q.points, 0)
            };
            questions.push(matchingQuestion);
          }
        });
      }
      
      // DON'T shuffle all questions - keep multiple choice first, then matching sections in order
      setAllQuestions(questions);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setResults([]);
      setShowResult(false);
      setShowFinalSummary(false);
      setSelectedMatchingItems({});
      setMatchingPairs([]);
      
      // Reset matching timer states
      setMatchingTimerStarted(false);
      setInitialMatchingTime(0);
      
      // Start timer for first question
      if (questions.length > 0) {
        const firstQuestion = questions[0];
        const timeLimit = 'question_text' in firstQuestion ? firstQuestion.time_limit : 300;
        setTimeLeft(timeLimit);
        setIsTimerActive(true);
      }

      // Initialize audio when modal opens
      initializeAudio();
    }
  }, [quiz, isOpen]);

  // Audio initialization and management
  const initializeAudio = () => {
    // Create audio elements (using placeholder URLs - you'll need to add actual audio files)
    if (!backgroundMusicRef.current) {
      backgroundMusicRef.current = new Audio();
      backgroundMusicRef.current.src = '/audio/quiz-background.mp3'; // Add your background music file
      backgroundMusicRef.current.loop = true;
      backgroundMusicRef.current.volume = 0.3;
      
      // Add event listener to handle audio end (in case loop fails)
      backgroundMusicRef.current.addEventListener('ended', () => {
        if (!isMuted && !showFinalSummary) {
          setTimeout(() => {
            if (backgroundMusicRef.current) {
              backgroundMusicRef.current.currentTime = 0;
              backgroundMusicRef.current.play().catch(err => console.log('Background music restart error:', err));
            }
          }, 100);
        }
      });
    }

    if (!correctSoundRef.current) {
      correctSoundRef.current = new Audio();
      correctSoundRef.current.src = '/audio/correct.mp3'; // Add your correct sound file
      correctSoundRef.current.volume = 0.7;
    }

    if (!incorrectSoundRef.current) {
      incorrectSoundRef.current = new Audio();
      incorrectSoundRef.current.src = '/audio/incorrect.mp3'; // Add your incorrect sound file
      incorrectSoundRef.current.volume = 0.7;
    }

    if (!tickingSoundRef.current) {
      tickingSoundRef.current = new Audio();
      tickingSoundRef.current.src = '/audio/ticking.mp3'; // Add your ticking sound file
      tickingSoundRef.current.loop = true;
      tickingSoundRef.current.volume = 0.4;
    }

    // Start background music
    if (!isMuted && backgroundMusicRef.current) {
      backgroundMusicRef.current.play().catch(err => console.log('Background music autoplay prevented:', err));
    }
  };

  // Monitor final summary state to control background music
  useEffect(() => {
    if (showFinalSummary) {
      // Stop background music when showing final summary
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
      }
    } else if (!isMuted && backgroundMusicRef.current && isOpen) {
      // Resume background music when not in final summary and not muted
      backgroundMusicRef.current.play().catch(err => console.log('Background music resume error:', err));
    }
  }, [showFinalSummary, isMuted, isOpen]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current.currentTime = 0;
      }
      if (tickingSoundRef.current) {
        tickingSoundRef.current.pause();
        tickingSoundRef.current.currentTime = 0;
      }
    };
  }, []);

  // Handle modal close - stop all audio
  const handleClose = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
    }
    if (tickingSoundRef.current) {
      tickingSoundRef.current.pause();
      tickingSoundRef.current.currentTime = 0;
    }
    onClose();
  };

  // Restart background music when going back from final summary
  const handleBackFromSummary = () => {
    setShowFinalSummary(false);
    
    // Restart background music if not muted
    if (!isMuted && backgroundMusicRef.current) {
      backgroundMusicRef.current.play().catch(err => console.log('Background music restart error:', err));
    }
  };

  // Play sound effects
  const playSound = (type: 'correct' | 'incorrect' | 'ticking') => {
    if (isMuted) return;

    switch (type) {
      case 'correct':
        if (correctSoundRef.current) {
          correctSoundRef.current.currentTime = 0;
          correctSoundRef.current.play().catch(err => console.log('Correct sound error:', err));
        }
        break;
      case 'incorrect':
        if (incorrectSoundRef.current) {
          incorrectSoundRef.current.currentTime = 0;
          incorrectSoundRef.current.play().catch(err => console.log('Incorrect sound error:', err));
        }
        break;
      case 'ticking':
        if (tickingSoundRef.current) {
          tickingSoundRef.current.play().catch(err => console.log('Ticking sound error:', err));
        }
        break;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    if (!isMuted) {
      // Muting
      if (backgroundMusicRef.current) backgroundMusicRef.current.pause();
      if (tickingSoundRef.current) tickingSoundRef.current.pause();
    } else {
      // Unmuting
      if (backgroundMusicRef.current) backgroundMusicRef.current.play().catch(err => console.log('Background music error:', err));
    }
  };

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && timeLeft > 0 && !showResult) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          // Play ticking sound when time is running low
          if (prev <= 30 && prev > 1) {
            playSound('ticking');
          } else if (prev > 30 && tickingSoundRef.current) {
            tickingSoundRef.current.pause();
          }

          if (prev <= 1) {
            setIsTimerActive(false);
            if (tickingSoundRef.current) {
              tickingSoundRef.current.pause();
            }
            // Auto submit when time runs out
            setTimeout(() => checkCurrentAnswer(), 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (tickingSoundRef.current) {
      tickingSoundRef.current.pause();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeLeft, showResult]);

  // Reset timer when changing questions
  useEffect(() => {
    if (allQuestions[currentQuestionIndex] && !showResult) {
      const currentQuestion = allQuestions[currentQuestionIndex];
      let timeLimit = 300; // default
      
      if (currentQuestion && 'question_text' in currentQuestion) {
        timeLimit = currentQuestion.time_limit;
        setTimeLeft(timeLimit);
        setIsTimerActive(true);
      } else if (currentQuestion && (currentQuestion as any).type === 'matching') {
        // For matching questions, use continuous timer
        if (!matchingTimerStarted) {
          // First matching question - start the timer
          timeLimit = quiz?.matching_quiz?.time_limit || 300;
          setInitialMatchingTime(timeLimit);
          setTimeLeft(timeLimit);
          setMatchingTimerStarted(true);
          setIsTimerActive(true);
        } else {
          // Subsequent matching questions - continue with current time
          setIsTimerActive(true);
        }
      } else if (currentQuestion && (currentQuestion as any).type === 'matching_intro') {
        timeLimit = 60; // 1 minute for intro
        setTimeLeft(timeLimit);
        setIsTimerActive(false); // No timer for intro
      }
      
      // Reset matching states for new questions
      if ((currentQuestion as any).type === 'matching') {
        setSelectedMatchingItems({});
        setMatchingPairs([]);
      }
    }
  }, [currentQuestionIndex, showResult, allQuestions, quiz, matchingTimerStarted]);

  // Force re-render of connection lines when matching pairs change
  useEffect(() => {
    if (matchingPairs.length > 0) {
      const timer = setTimeout(() => {
        // Force re-render by triggering a minimal state update
        setSelectedMatchingItems(prev => ({ ...prev }));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [matchingPairs]);

  if (!isOpen || !quiz) return null;

  const currentQuestion = allQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;

  // Helper functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (!currentQuestion) return 'text-blue-600';
    
    let totalTime = 300;
    if (currentQuestion && 'question_text' in currentQuestion) {
      totalTime = currentQuestion.time_limit;
    } else if (currentQuestion && (currentQuestion as any).type === 'matching') {
      // For matching questions, use initial matching time
      totalTime = initialMatchingTime || quiz?.matching_quiz?.time_limit || 300;
    } else {
      totalTime = 300;
    }
    
    const percentage = (timeLeft / totalTime) * 100;
    
    if (percentage <= 20) return 'text-red-600';
    if (percentage <= 50) return 'text-orange-600';
    return 'text-blue-600';
  };

  const getCorrectAnswersCount = () => {
    // Only count correct answers for scoreable questions (exclude intro)
    return results.filter(result => {
      if (!result.isCorrect) return false;
      
      // Check if this result belongs to a scoreable question
      const question = allQuestions.find(q => {
        const questionId = 'question_text' in q ? q.question_id : q.id;
        return questionId === result.questionId;
      });
      
      return question && (question as any).type !== 'matching_intro';
    }).length;
  };
  
  // Helper function to get only scoreable questions (exclude intro)
  const getScoreableQuestions = () => {
    return allQuestions.filter(q => (q as any).type !== 'matching_intro');
  };

  // Helper function to get current question display info
  const getCurrentQuestionDisplayInfo = () => {
    const scoreableQuestions = getScoreableQuestions();
    const currentIsScoreable = currentQuestion && (currentQuestion as any).type !== 'matching_intro';
    
    if (!currentIsScoreable) {
      // For intro questions, show as "Giới thiệu"
      return {
        current: 'Giới thiệu',
        total: scoreableQuestions.length,
        isIntro: true
      };
    }
    
    // For scoreable questions, find its position among scoreable questions
    const scoreableIndex = scoreableQuestions.findIndex(q => {
      const questionId = 'question_text' in q ? q.question_id : q.id;
      const currentId = 'question_text' in currentQuestion ? currentQuestion.question_id : currentQuestion.id;
      return questionId === currentId;
    });
    
    return {
      current: scoreableIndex + 1,
      total: scoreableQuestions.length,
      isIntro: false
    };
  };
  
  const getScorePercentage = () => {
    const scoreableQuestions = getScoreableQuestions();
    if (scoreableQuestions.length === 0) return 0;
    
    // Count correct answers for scoreable questions only
    const scoreableCorrectCount = results.filter(result => {
      if (!result.isCorrect) return false;
      
      // Check if this result belongs to a scoreable question
      const question = allQuestions.find(q => {
        const questionId = 'question_text' in q ? q.question_id : q.id;
        return questionId === result.questionId;
      });
      
      return question && (question as any).type !== 'matching_intro';
    }).length;
    
    return Math.round((scoreableCorrectCount / scoreableQuestions.length) * 100);
  };
  
  const getPerformanceMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return "Xuất sắc! 🎉";
    if (percentage >= 80) return "Rất tốt! 👏";
    if (percentage >= 70) return "Tốt! 👍";
    if (percentage >= 60) return "Khá! 🙂";
    return "Cần cố gắng thêm! 💪";
  };

  const getTotalScore = () => {
    return results.reduce((total, result) => {
      if (result.isCorrect) {
        const question = allQuestions.find(q => {
          const questionId = 'question_text' in q ? q.question_id : q.id;
          return questionId === result.questionId;
        });
        // Only add points if it's not a matching_intro question
        if (question && (question as any).type !== 'matching_intro') {
          return total + (question?.points || 0);
        }
      }
      return total;
    }, 0);
  };

  const getMaxScore = () => {
    // Only count points from scoreable questions (exclude intro)
    return getScoreableQuestions().reduce((total, question) => total + question.points, 0);
  };

  // Handle answers
  const handleMultipleChoiceAnswer = (questionId: string, answerIndex: string, allowMultiple: boolean) => {
    const existingAnswer = userAnswers.find(a => a.questionId === questionId);
    
    if (existingAnswer) {
      if (allowMultiple) {
        const currentAnswers = existingAnswer.selectedAnswers || [];
        const newAnswers = currentAnswers.includes(answerIndex)
          ? currentAnswers.filter(idx => idx !== answerIndex)
          : [...currentAnswers, answerIndex];
        
        setUserAnswers(prev => prev.map(a => 
          a.questionId === questionId ? { ...a, selectedAnswers: newAnswers } : a
        ));
      } else {
        setUserAnswers(prev => prev.map(a => 
          a.questionId === questionId ? { ...a, selectedAnswers: [answerIndex] } : a
        ));
      }
    } else {
      setUserAnswers(prev => [...prev, { questionId, type: 'multiple_choice', selectedAnswers: [answerIndex] }]);
    }
  };

  // Handle matching selection with smooth animations
  const handleMatchingItemClick = (itemKey: string, column: 'A' | 'B') => {
    if (showResult) return; // Prevent changes after result is shown
    
    // Find the actual item content from the key
    const currentQuestion = allQuestions[currentQuestionIndex];
    const shuffledData = shuffledGroupedQuestions[(currentQuestion as any).typeKey];
    const columnData = column === 'A' ? shuffledData?.columnA : shuffledData?.columnB;
    const actualItem = columnData?.find(item => item.uniqueKey === itemKey);
    
    if (!actualItem) return;
    
    const item = actualItem.content;
    const selectionKey = `${column}-${itemKey}`;
    
    // Check if this item is already matched
    const isAlreadyMatched = matchingPairs.some(pair => 
      pair.itemA === item || pair.itemB === item
    );
    
    if (isAlreadyMatched) {
      // Allow unmatching by clicking on matched item
      const pairIndex = matchingPairs.findIndex(pair => 
        pair.itemA === item || pair.itemB === item
      );
      if (pairIndex >= 0) {
        removePair(pairIndex);
      }
      return;
    }
    
    // If already selected, deselect
    if (selectedMatchingItems[selectionKey]) {
      setSelectedMatchingItems(prev => ({ ...prev, [selectionKey]: false }));
      return;
    }
    
    // Clear all other selections in the same column first
    setSelectedMatchingItems(prev => {
      const updated = { ...prev };
      // Clear all selections in the current column
      Object.keys(updated).forEach(key => {
        if (key.startsWith(`${column}-`)) {
          updated[key] = false;
        }
      });
      // Set current item as selected
      updated[selectionKey] = true;
      return updated;
    });
    
    // Find if there's already a selected item from the other column
    const otherColumn = column === 'A' ? 'B' : 'A';
    const selectedFromOtherColumn = Object.keys(selectedMatchingItems).find(
      key => key.startsWith(`${otherColumn}-`) && selectedMatchingItems[key]
    );
    
    if (selectedFromOtherColumn) {
      const otherItemKey = selectedFromOtherColumn.substring(2); // Remove "A-" or "B-"
      const otherColumnData = otherColumn === 'A' ? shuffledData?.columnA : shuffledData?.columnB;
      const otherActualItem = otherColumnData?.find(item => item.uniqueKey === otherItemKey);
      
      if (!otherActualItem) return;
      
      const otherItem = otherActualItem.content;
      
      // Check if the other item is already matched (double check for safety)
      const otherItemAlreadyMatched = matchingPairs.some(pair => 
        pair.itemA === otherItem || pair.itemB === otherItem
      );
      
      if (otherItemAlreadyMatched) {
        // If other item is already matched, just deselect it
        setSelectedMatchingItems(prev => ({
          ...prev,
          [selectedFromOtherColumn]: false
        }));
        return;
      }
      
      // Create a pair with smooth animation
      const newPair = column === 'A' 
        ? { itemA: item, itemB: otherItem }
        : { itemA: otherItem, itemB: item };
      
      // Add visual feedback
      setMatchingPairs(prev => [...prev, newPair]);
      
      // Clear selections with animation delay
      setTimeout(() => {
        setSelectedMatchingItems(prev => ({
          ...prev,
          [selectionKey]: false,
          [selectedFromOtherColumn]: false
        }));
      }, 150);
      
      // Update user answers
      setUserAnswers(prev => {
        const questionId = currentQuestion && !('question_text' in currentQuestion) ? currentQuestion.id : '';
        const existingIndex = prev.findIndex(a => a.questionId === questionId);
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = { 
            ...updated[existingIndex], 
            matchingPairs: [...(updated[existingIndex].matchingPairs || []), newPair]
          };
          return updated;
        } else {
          return [...prev, { 
            questionId, 
            type: 'matching', 
            matchingPairs: [newPair] 
          }];
        }
      });
      
      // Play a subtle success sound for pairing
      if (!isMuted && correctSoundRef.current) {
        const audio = correctSoundRef.current.cloneNode() as HTMLAudioElement;
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }
    }
  };

  const removePair = (pairIndex: number) => {
    if (showResult) return; // Prevent changes after result is shown
    
    // Get the pair being removed to clear any related selections
    const pairToRemove = matchingPairs[pairIndex];
    
    setMatchingPairs(prev => prev.filter((_, index) => index !== pairIndex));
    
    // Clear any selections related to the removed pair
    if (pairToRemove) {
      setSelectedMatchingItems(prev => {
        const updated = { ...prev };
        delete updated[`A-${pairToRemove.itemA}`];
        delete updated[`B-${pairToRemove.itemB}`];
        return updated;
      });
    }
    
    // Update user answers
    setUserAnswers(prev => prev.map(ua => {
      if (ua.type === 'matching' && ua.matchingPairs) {
        return {
          ...ua,
          matchingPairs: ua.matchingPairs.filter((_, index) => index !== pairIndex)
        };
      }
      return ua;
    }));
    
    // Add visual feedback when removing
    if (!isMuted && incorrectSoundRef.current) {
      const audio = incorrectSoundRef.current.cloneNode() as HTMLAudioElement;
      audio.volume = 0.2;
      audio.play().catch(() => {});
    }
  };

  // Check current answer
  const checkCurrentAnswer = () => {
    setIsTimerActive(false);
    
    // Skip checking for intro questions
    if ((currentQuestion as any)?.type === 'matching_intro') {
      goToNextQuestion();
      return;
    }
    
    const currentQuestionId = (currentQuestion && 'question_text' in currentQuestion) ? currentQuestion.question_id : currentQuestion?.id;
    const userAnswer = userAnswers.find(a => a.questionId === currentQuestionId);
    let isCorrect = false;
    let correctAnswer: any = null;

    if (currentQuestion && 'question_text' in currentQuestion) {
      // Multiple choice
      const mcQuestion = currentQuestion as MultipleChoiceQuestion & { type: 'multiple_choice' };
      correctAnswer = mcQuestion.answers
        .map((answer, index) => ({ answer, index }))
        .filter(({ answer }) => answer.correct)
        .map(({ index }) => index.toString());
      
      if (userAnswer?.selectedAnswers) {
        const userAnswerIndices = userAnswer.selectedAnswers.sort();
        const correctAnswerIndices = correctAnswer.sort();
        isCorrect = userAnswerIndices.length === correctAnswerIndices.length && 
                   userAnswerIndices.every((idx, index) => idx === correctAnswerIndices[index]);
      }
    } else if (currentQuestion.type === 'matching') {
      // Individual matching type - only check pairs for this specific type
      const currentMatchingQuestion = currentQuestion as any;
      const typeQuestions = currentMatchingQuestion.questions;
      correctAnswer = typeQuestions.map((q: any) => ({ itemA: q.item_a.content, itemB: q.item_b.content }));
      
      if (matchingPairs && matchingPairs.length > 0) {
        // Check if user matched all pairs correctly for this type
        const correctPairsCount = matchingPairs.filter(userPair => 
          correctAnswer.some((correctPair: any) => 
            userPair.itemA === correctPair.itemA && userPair.itemB === correctPair.itemB
          )
        ).length;
        
        // User needs to match all pairs correctly for this type
        isCorrect = correctPairsCount === typeQuestions.length && 
                   matchingPairs.length === typeQuestions.length;
      }
    }

    // Play sound and show animation based on result
    if (isCorrect) {
      playSound('correct');
      setShowCorrectAnimation(true);
      setTimeout(() => setShowCorrectAnimation(false), 2000);
    } else {
      playSound('incorrect');
      setShowIncorrectAnimation(true);
      setTimeout(() => setShowIncorrectAnimation(false), 2000);
    }

    // Stop ticking sound
    if (tickingSoundRef.current) {
      tickingSoundRef.current.pause();
    }

    const result: QuestionResult = {
      questionId: currentQuestionId,
      isCorrect,
      userAnswer: userAnswer || { 
        questionId: currentQuestionId, 
        type: (currentQuestion && 'question_text' in currentQuestion) ? 'multiple_choice' : 'matching',
        matchingPairs: (currentQuestion && currentQuestion.type === 'matching') ? matchingPairs : undefined
      },
      correctAnswer
    };

    setResults(prev => {
      const existingIndex = prev.findIndex(r => r.questionId === currentQuestionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = result;
        return updated;
      }
      return [...prev, result];
    });

    setShowResult(true);
  };

  const goToNextQuestion = () => {
    setShowResult(false);
    if (!isLastQuestion) setCurrentQuestionIndex(prev => prev + 1);
  };

  const goToPreviousQuestion = () => {
    setShowResult(false);
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    if ((currentQuestion as any).type === 'matching_intro') {
      return renderMatchingIntro(currentQuestion);
    }

    if (currentQuestion.type === 'matching') {
      return renderIndividualMatchingQuestion(currentQuestion);
    }

    // Regular multiple choice question
    return renderMultipleChoiceQuestion(currentQuestion as MultipleChoiceQuestion & { type: 'multiple_choice' });
  };

  const getCurrentQuestionResult = () => {
    const currentQuestionId = (currentQuestion && 'question_text' in currentQuestion) ? currentQuestion.question_id : currentQuestion?.id;
    return results.find(r => r.questionId === currentQuestionId);
  };

  // Handle final summary with confetti
  const handleShowFinalSummary = () => {
    const percentage = getScorePercentage();
    if (percentage >= 70) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    
    // Stop background music when showing final summary
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
    }
    
    setShowFinalSummary(true);
  };

  // Confetti Animation Component
  const ConfettiAnimation = () => (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-2 h-2 animate-pulse ${
            ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'][i % 6]
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );

  // Floating Animation Component
  const FloatingShapes = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={`absolute opacity-10 animate-bounce ${
            i % 2 === 0 ? 'bg-blue-500 rounded-full' : 'bg-purple-500 transform rotate-45'
          }`}
          style={{
            width: `${20 + Math.random() * 40}px`,
            height: `${20 + Math.random() * 40}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );

  // Render components
  const renderMatchingIntro = (introQuestion: any) => {
    const getTypeConfig = (typeKey: string) => {
      switch (typeKey) {
        case 'TEXT-TEXT':
          return { icon: '📝', label: 'Văn bản - Văn bản', color: 'blue' };
        case 'TEXT-IMAGE':
          return { icon: '📝🖼️', label: 'Văn bản - Hình ảnh', color: 'purple' };
        case 'IMAGE-TEXT':
          return { icon: '🖼️📝', label: 'Hình ảnh - Văn bản', color: 'indigo' };
        case 'IMAGE-IMAGE':
          return { icon: '🖼️', label: 'Hình ảnh - Hình ảnh', color: 'pink' };
        default:
          return { icon: '❓', label: typeKey, color: 'gray' };
      }
    };

    const activeGroups = Object.keys(groupedMatchingQuestions).filter(
      typeKey => groupedMatchingQuestions[typeKey].length > 0
    );

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaQuestionCircle className="text-3xl text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Phần ghép đôi
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Sẵn sàng cho thử thách ghép đôi? Hãy cùng tìm hiểu!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <FaClock className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Tổng thời gian</h4>
                  <p className="text-2xl font-bold text-blue-600">{formatTime(introQuestion.totalTime)}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Thời gian dành cho tất cả các phần ghép đôi
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <FaQuestionCircle className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Tổng câu hỏi</h4>
                  <p className="text-2xl font-bold text-green-600">{introQuestion.totalQuestions} cặp</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chia thành {introQuestion.groupCount} phần khác nhau
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Các phần ghép đôi bạn sẽ gặp:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGroups.map((typeKey, index) => {
                const config = getTypeConfig(typeKey);
                const questionCount = groupedMatchingQuestions[typeKey].length;
                
                return (
                  <div key={typeKey} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="text-2xl">{config.icon}</div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 dark:text-white">{config.label}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{questionCount} cặp ghép</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              💡 Cách chơi ghép đôi:
            </h5>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Nhấp vào một item từ cột trái, sau đó nhấp vào item tương ứng từ cột phải</li>
              <li>• Nhấp vào cặp đã ghép để hủy bỏ nếu muốn sửa lại</li>
              <li>• Mỗi phần có thời gian riêng, hãy suy nghĩ cẩn thận!</li>
              <li>• Ghép đúng tất cả các cặp để đạt điểm tối đa</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Sẵn sàng bắt đầu thử thách ghép đôi?
          </p>
          <div className="flex items-center justify-center gap-2 text-green-600">
            <FaCheck className="animate-pulse" />
            <span className="font-medium">Nhấn "Tiếp theo" để bắt đầu!</span>
          </div>
        </div>
      </div>
    );
  };

  const renderIndividualMatchingQuestion = (question: any) => {
    const config = getTypeConfig(question.typeKey);
    const questionData = question.questions;
    const shuffledData = shuffledGroupedQuestions[question.typeKey];
    
    if (!shuffledData || questionData.length === 0) return null;
    
    const displayColumnA = shuffledData.columnA || [];
    const displayColumnB = shuffledData.columnB || [];

    // Component for rendering connection lines
    const ConnectionLines = () => {
      const [connections, setConnections] = useState<Array<{
        startX: number;
        startY: number;
        endX: number;
        endY: number;
        isCorrect: boolean;
        pairIndex: number;
      }>>([]);

      useEffect(() => {
        const updateConnections = () => {
          const newConnections: Array<{
            startX: number;
            startY: number;
            endX: number;
            endY: number;
            isCorrect: boolean;
            pairIndex: number;
          }> = [];

          matchingPairs.forEach((pair, index) => {
            const itemAElement = document.querySelector(`[data-item="A-${pair.itemA}"]`) as HTMLElement;
            const itemBElement = document.querySelector(`[data-item="B-${pair.itemB}"]`) as HTMLElement;
            const containerElement = document.querySelector('[data-connection-container]') as HTMLElement;
            
            if (itemAElement && itemBElement && containerElement) {
              const containerRect = containerElement.getBoundingClientRect();
              const rectA = itemAElement.getBoundingClientRect();
              const rectB = itemBElement.getBoundingClientRect();
              
              const startX = rectA.right - containerRect.left;
              const startY = rectA.top + rectA.height / 2 - containerRect.top;
              const endX = rectB.left - containerRect.left;
              const endY = rectB.top + rectB.height / 2 - containerRect.top;
              
              const isCorrect = showResult && questionData.some((q: any) => 
                q.item_a.content === pair.itemA && q.item_b.content === pair.itemB
              );
              
              newConnections.push({
                startX,
                startY,
                endX,
                endY,
                isCorrect,
                pairIndex: index
              });
            }
          });

          setConnections(newConnections);
        };

        // Initial update
        updateConnections();

        // Update on resize
        const handleResize = () => updateConnections();
        window.addEventListener('resize', handleResize);

        // Update periodically for DOM changes
        const interval = setInterval(updateConnections, 100);

        return () => {
          window.removeEventListener('resize', handleResize);
          clearInterval(interval);
        };
      }, [matchingPairs, showResult, questionData]);

      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
          <defs>
            {connections.map((_, index) => (
              <linearGradient key={`gradient-${index}`} id={`connectionGradient${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            ))}
          </defs>
          {connections.map((connection, index) => {
            const midX = (connection.startX + connection.endX) / 2;
            const controlY = Math.min(connection.startY, connection.endY) - 40;
            
            return (
              <g key={index}>
                <path
                  d={`M ${connection.startX} ${connection.startY} Q ${midX} ${controlY} ${connection.endX} ${connection.endY}`}
                  stroke={showResult ? (connection.isCorrect ? "#10b981" : "#ef4444") : `url(#connectionGradient${index})`}
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={showResult && !connection.isCorrect ? "8,4" : "none"}
                  className="drop-shadow-sm animate-pulse"
                  style={{
                    filter: showResult ? 'none' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                />
                <circle
                  cx={connection.startX}
                  cy={connection.startY}
                  r="5"
                  fill={showResult ? (connection.isCorrect ? "#10b981" : "#ef4444") : "#3b82f6"}
                  className="drop-shadow-sm"
                />
                <circle
                  cx={connection.endX}
                  cy={connection.endY}
                  r="5"
                  fill={showResult ? (connection.isCorrect ? "#10b981" : "#ef4444") : "#8b5cf6"}
                  className="drop-shadow-sm"
                />
              </g>
            );
          })}
        </svg>
      );
    };
    
    return (
      <div className="space-y-6">
        <div className={`${config.bgClass} border ${config.borderClass} rounded-lg p-4`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{config.icon}</span>
              <div>
                <h3 className={`text-xl font-bold ${config.textClass}`}>
                  {config.label}
                </h3>
                <p className={`text-sm ${config.subtextClass}`}>
                  Ghép {questionData.length} cặp tương ứng
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-sm font-semibold ${getTimeColor()}`}>
                <FaClock className="inline mr-1" />
                {formatTime(timeLeft)}
              </div>
              <div className={`px-3 py-1 ${config.badgeClass} rounded-full text-sm font-medium`}>
                {question.points} điểm
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative" data-connection-container>
            {/* Connection Lines Component */}
            <ConnectionLines />
            
            {/* Column A */}
            <div className="space-y-3">
              <h5 className="font-semibold text-blue-600 dark:text-blue-400 text-base border-b border-blue-200 dark:border-blue-700 pb-2">
                Cột A ({displayColumnA.length} items)
              </h5>
              <div className="space-y-2">
                {displayColumnA.map((item: any, index: number) => {
                  const isSelected = selectedMatchingItems[`A-${item.uniqueKey}`];
                  const isMatched = matchingPairs.some(pair => pair.itemA === item.content);
                  const isCorrect = showResult && questionData.some((q: any) => 
                    q.item_a.content === item.content && 
                    matchingPairs.some(pair => pair.itemA === item.content && pair.itemB === q.item_b.content)
                  );
                  
                  return (
                    <button
                      key={`a-${item.uniqueKey}-${index}`}
                      onClick={() => handleMatchingItemClick(item.uniqueKey, 'A')}
                      disabled={showResult}
                      data-item={`A-${item.content}`}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] relative min-h-[120px] ${
                        isCorrect 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg'
                          : isMatched 
                          ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30 shadow-md cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/40'
                          : isSelected
                          ? 'border-blue-600 bg-blue-200 dark:bg-blue-800/40 ring-2 ring-blue-300 shadow-lg animate-pulse'
                          : 'border-blue-200 dark:border-blue-600 hover:border-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3 h-full">
                        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${
                          isCorrect ? 'bg-green-600 text-white' : 
                          isMatched ? 'bg-blue-600 text-white' :
                          isSelected ? 'bg-blue-700 text-white animate-pulse' : 'bg-blue-600 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0 flex items-center">
                          <div className="text-gray-900 dark:text-white font-medium w-full">
                            {item.type === 'IMAGE' ? (
                              item.content && item.content.startsWith('http') ? (
                                <div className="w-full">
                                  <img
                                    src={item.content}
                                    alt="Nội dung A"
                                    className="w-full h-20 object-contain rounded-xl border-2 border-blue-300 dark:border-blue-500 shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                                    style={{
                                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                      padding: '4px'
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-20 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-xl flex flex-col items-center justify-center shadow-lg transform transition-all duration-200 hover:scale-105">
                                  <div className="text-2xl mb-1 animate-bounce">🖼️</div>
                                  <div className="text-blue-700 dark:text-blue-200 text-xs font-semibold">Hình ảnh</div>
                                </div>
                              )
                            ) : (
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-600 h-20 flex items-center justify-center">
                                <span className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 font-medium text-center">{item.content}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {isMatched && !showResult && (
                          <div className="flex items-center gap-1">
                            <FaCheck className="text-blue-600 flex-shrink-0" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Column B */}
            <div className="space-y-3">
              <h5 className="font-semibold text-purple-600 dark:text-purple-400 text-base border-b border-purple-200 dark:border-purple-700 pb-2">
                Cột B ({displayColumnB.length} items)
              </h5>
              <div className="space-y-2">
                {displayColumnB.map((item: any, index: number) => {
                  const isSelected = selectedMatchingItems[`B-${item.uniqueKey}`];
                  const isMatched = matchingPairs.some(pair => pair.itemB === item.content);
                  const isCorrect = showResult && questionData.some((q: any) => 
                    q.item_b.content === item.content && 
                    matchingPairs.some(pair => pair.itemB === item.content && pair.itemA === q.item_a.content)
                  );
                  
                  return (
                    <button
                      key={`b-${item.uniqueKey}-${index}`}
                      onClick={() => handleMatchingItemClick(item.uniqueKey, 'B')}
                      disabled={showResult}
                      data-item={`B-${item.content}`}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] relative min-h-[120px] ${
                        isCorrect 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg'
                          : isMatched 
                          ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30 shadow-md cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/40'
                          : isSelected
                          ? 'border-purple-600 bg-purple-200 dark:bg-purple-800/40 ring-2 ring-purple-300 shadow-lg animate-pulse'
                          : 'border-purple-200 dark:border-purple-600 hover:border-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3 h-full">
                        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${
                          isCorrect ? 'bg-green-600 text-white' : 
                          isMatched ? 'bg-purple-600 text-white' :
                          isSelected ? 'bg-purple-700 text-white animate-pulse' : 'bg-purple-600 text-white'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div className="flex-1 min-w-0 flex items-center">
                          <div className="text-gray-900 dark:text-white font-medium w-full">
                            {item.type === 'IMAGE' ? (
                              item.content && item.content.startsWith('http') ? (
                                <div className="w-full">
                                  <img
                                    src={item.content}
                                    alt="Nội dung B"
                                    className="w-full h-20 object-contain rounded-xl border-2 border-purple-300 dark:border-purple-500 shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                                    style={{
                                      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                                      padding: '4px'
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-20 bg-gradient-to-br from-purple-100 via-purple-200 to-pink-200 dark:from-purple-800 dark:via-purple-700 dark:to-pink-700 border-2 border-dashed border-purple-400 dark:border-purple-500 rounded-xl flex flex-col items-center justify-center shadow-lg transform transition-all duration-200 hover:scale-105">
                                  <div className="text-2xl mb-1 animate-bounce">🖼️</div>
                                  <div className="text-purple-700 dark:text-purple-200 text-xs font-semibold">Hình ảnh</div>
                                </div>
                              )
                            ) : (
                              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-600 h-20 flex items-center justify-center">
                                <span className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 font-medium text-center">{item.content}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {isMatched && !showResult && (
                          <div className="flex items-center gap-1">
                            <FaCheck className="text-purple-600 flex-shrink-0" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Correct answers section (only shown when showResult is true) */}
        {showResult && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h6 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
              <FaCheck className="text-green-600" />
              Đáp án đúng
            </h6>
            <div className="space-y-3">
              {questionData.map((correctPair: any, index: number) => {
                const userMatched = matchingPairs.some(pair => 
                  pair.itemA === correctPair.item_a.content && pair.itemB === correctPair.item_b.content
                );
                
                return (
                  <div 
                    key={index} 
                    className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                      userMatched 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300 dark:border-green-600 shadow-lg'
                        : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700 shadow-md'
                    }`}
                  >
                    <div className="flex items-center p-4">
                      {/* Item A */}
                      <div className="flex-1 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
                          userMatched ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          {correctPair.item_a.matching_type === 'IMAGE' ? (
                            correctPair.item_a.content && correctPair.item_a.content.startsWith('http') ? (
                              <div className="w-24 h-16">
                                <img
                                  src={correctPair.item_a.content}
                                  alt="Item A"
                                  className="w-full h-full object-contain rounded-lg border-2 border-blue-300 shadow-md"
                                />
                              </div>
                            ) : (
                              <div className="w-24 h-16 bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🖼️</span>
                              </div>
                            )
                          ) : (
                            <div className="bg-blue-100 dark:bg-blue-800/30 p-2 rounded-lg border border-blue-300 dark:border-blue-600">
                              <span className="font-medium text-gray-900 dark:text-white text-sm">
                                {correctPair.item_a.content}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Connection Line */}
                      <div className="flex items-center gap-2 mx-4">
                        <div className={`w-8 h-0.5 ${userMatched ? 'bg-green-500' : 'bg-red-500'} rounded`}></div>
                        <div className={`w-3 h-3 rounded-full ${userMatched ? 'bg-green-500' : 'bg-red-500'} shadow-md`}></div>
                        <div className={`w-8 h-0.5 ${userMatched ? 'bg-green-500' : 'bg-red-500'} rounded`}></div>
                      </div>
                      
                      {/* Item B */}
                      <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1 min-w-0 text-right">
                          {correctPair.item_b.matching_type === 'IMAGE' ? (
                            correctPair.item_b.content && correctPair.item_b.content.startsWith('http') ? (
                              <div className="w-24 h-16 ml-auto">
                                <img
                                  src={correctPair.item_b.content}
                                  alt="Item B"
                                  className="w-full h-full object-contain rounded-lg border-2 border-purple-300 shadow-md"
                                />
                              </div>
                            ) : (
                              <div className="w-24 h-16 ml-auto bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-dashed border-purple-400 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🖼️</span>
                              </div>
                            )
                          ) : (
                            <div className="bg-purple-100 dark:bg-purple-800/30 p-2 rounded-lg border border-purple-300 dark:border-purple-600">
                              <span className="font-medium text-gray-900 dark:text-white text-sm">
                                {correctPair.item_b.content}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
                          userMatched ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="ml-4 flex items-center gap-2">
                        {userMatched ? (
                          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-300 rounded-full border border-green-300 dark:border-green-600">
                            <FaCheck className="w-3 h-3" />
                            <span className="text-xs font-semibold">Đúng</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300 rounded-full border border-red-300 dark:border-red-600">
                            <FaTimes className="w-3 h-3" />
                            <span className="text-xs font-semibold">Sai</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Animated success/error indicator */}
                    <div className={`absolute top-0 left-0 w-2 h-full ${
                      userMatched ? 'bg-green-500' : 'bg-red-500'
                    } opacity-70`}></div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Điểm số:</span>
                <span className="font-bold text-lg">
                  {matchingPairs.filter(pair => 
                    questionData.some((q: any) => 
                      q.item_a.content === pair.itemA && q.item_b.content === pair.itemB
                    )
                  ).length} / {questionData.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getTypeConfig = (typeKey: string) => {
    switch (typeKey) {
      case 'TEXT-TEXT':
        return {
          icon: '📝',
          label: 'Văn bản - Văn bản',
          bgClass: 'bg-blue-50 dark:bg-blue-900/20',
          borderClass: 'border-blue-200 dark:border-blue-800',
          textClass: 'text-blue-800 dark:text-blue-200',
          subtextClass: 'text-blue-600 dark:text-blue-400',
          badgeClass: 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
        };
      case 'TEXT-IMAGE':
        return {
          icon: '📝🖼️',
          label: 'Văn bản - Hình ảnh',
          bgClass: 'bg-purple-50 dark:bg-purple-900/20',
          borderClass: 'border-purple-200 dark:border-purple-800',
          textClass: 'text-purple-800 dark:text-purple-200',
          subtextClass: 'text-purple-600 dark:text-purple-400',
          badgeClass: 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200',
        };
      case 'IMAGE-TEXT':
        return {
          icon: '🖼️📝',
          label: 'Hình ảnh - Văn bản',
          bgClass: 'bg-indigo-50 dark:bg-indigo-900/20',
          borderClass: 'border-indigo-200 dark:border-indigo-800',
          textClass: 'text-indigo-800 dark:text-indigo-200',
          subtextClass: 'text-indigo-600 dark:text-indigo-400',
          badgeClass: 'bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200',
        };
      case 'IMAGE-IMAGE':
        return {
          icon: '🖼️',
          label: 'Hình ảnh - Hình ảnh',
          bgClass: 'bg-pink-50 dark:bg-pink-900/20',
          borderClass: 'border-pink-200 dark:border-pink-800',
          textClass: 'text-pink-800 dark:text-pink-200',
          subtextClass: 'text-pink-600 dark:text-pink-400',
          badgeClass: 'bg-pink-100 dark:bg-pink-800 text-pink-800 dark:text-pink-200',
        };
      default:
        return {
          icon: '❓',
          label: typeKey,
          bgClass: 'bg-gray-50 dark:bg-gray-900/20',
          borderClass: 'border-gray-200 dark:border-gray-800',
          textClass: 'text-gray-800 dark:text-gray-200',
          subtextClass: 'text-gray-600 dark:text-gray-400',
          badgeClass: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
        };
    }
  };
  const renderMultipleChoiceQuestion = (question: MultipleChoiceQuestion & { type: 'multiple_choice' }) => {
    const userAnswer = userAnswers.find(a => a.questionId === question.question_id);
    const questionResult = getCurrentQuestionResult();
    const isMultipleChoice = question.allow_multiple_answers;
    
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{question.question_text}</h3>
          {question.hint && (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
              <FaQuestionCircle />
              <span>Gợi ý: {question.hint}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {question.answers.map((answer: Answer, index: number) => {
            const isSelected = userAnswer?.selectedAnswers?.includes(index.toString()) || false;
            const isCorrect = answer.correct;
            const showCorrectness = showResult && questionResult;
            
            return (
              <button
                key={index}
                onClick={() => !showResult && handleMultipleChoiceAnswer(question.question_id, index.toString(), question.allow_multiple_answers)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  showCorrectness
                    ? isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : isSelected
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-600'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 ${isMultipleChoice ? 'rounded-md' : 'rounded-full'} border-2 flex items-center justify-center ${
                    showCorrectness && isCorrect
                      ? 'border-green-500 bg-green-500'
                      : showCorrectness && isSelected && !isCorrect
                      ? 'border-red-500 bg-red-500'
                      : isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {(isSelected || (showCorrectness && isCorrect)) && (
                      <FaCheck className="text-white text-xs" />
                    )}
                  </div>
                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                  <span className="text-gray-900 dark:text-white">{answer.answer_text}</span>
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {question.allow_multiple_answers ? 'Có thể chọn nhiều đáp án (ô vuông)' : 'Chỉ chọn một đáp án (ô tròn)'}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className={`flex items-center gap-1 font-semibold ${getTimeColor()}`}>
              <FaClock />
              {formatTime(timeLeft)}
            </span>
            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
              {question.points} điểm
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Final Summary Screen
  if (showFinalSummary) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
          <div className="text-center p-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-t-lg">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTrophy className="text-3xl text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Hoàn thành bài kiểm tra!</h2>
            
            {/* Selected Student Info */}
            {selectedStudent && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {selectedStudent.first_name.charAt(0)}{selectedStudent.last_name.charAt(0)}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedStudent.first_name} {selectedStudent.last_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Học sinh được chọn kiểm tra
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-lg text-gray-600 dark:text-gray-400">{getPerformanceMessage()}</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {getCorrectAnswersCount()}/{getScoreableQuestions().length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Câu trả lời đúng</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{getScorePercentage()}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Tỷ lệ chính xác</div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Điểm số</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{getTotalScore()}/{getMaxScore()}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getMaxScore() > 0 ? (getTotalScore() / getMaxScore()) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar 
                    key={star}
                    className={`text-2xl ${getScorePercentage() >= star * 20 ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Đánh giá hiệu suất</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={handleBackFromSummary} className="flex items-center gap-2">
              <FaChevronLeft />
              Xem lại câu hỏi
            </Button>
            <Button onClick={handleClose} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <FaCheck />
              Hoàn thành
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Floating background shapes */}
      <FloatingShapes />
      
      {/* Confetti animation */}
      {showConfetti && <ConfettiAnimation />}
      
      {/* Success/Error animations */}
      {showCorrectAnimation && (
        <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
          <div className="bg-green-500 text-white text-6xl p-8 rounded-full animate-ping">
            <FaCheck />
          </div>
        </div>
      )}
      
      {showIncorrectAnimation && (
        <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
          <div className="bg-red-500 text-white text-6xl p-8 rounded-full animate-pulse">
            <FaTimes />
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{quiz.quiz.name}</h2>
            {(() => {
              const displayInfo = getCurrentQuestionDisplayInfo();
              return (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {displayInfo.isIntro ? 
                    `${displayInfo.current} | Tổng cộng: ${displayInfo.total} câu hỏi` :
                    `Câu ${displayInfo.current} / ${displayInfo.total}`
                  }
                </p>
              );
            })()}
          </div>
          <div className="flex items-center gap-3">
            {/* Audio control button */}
            <button
              onClick={toggleMute}
              className={`p-2 rounded-full transition-colors ${
                isMuted 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400' 
                  : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
              }`}
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <FaVolumeMute className="w-5 h-5" /> : <FaVolumeUp className="w-5 h-5" />}
            </button>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 relative overflow-hidden">
          {(() => {
            const displayInfo = getCurrentQuestionDisplayInfo();
            const scoreableQuestions = getScoreableQuestions();
            let progressPercentage = 0;
            
            if (displayInfo.isIntro) {
              // For intro, show minimal progress (like 5%)
              progressPercentage = 5;
            } else {
              // For actual questions, calculate progress based on scoreable questions
              const completedScoreableQuestions = currentQuestionIndex - (allQuestions.length - scoreableQuestions.length);
              progressPercentage = (completedScoreableQuestions / scoreableQuestions.length) * 100;
            }
            
            return (
              <div 
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 transition-all duration-500 ease-out relative"
                style={{ width: `${Math.max(0, Math.min(100, progressPercentage))}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            );
          })()}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {renderQuestion()}
          
          {/* Result Display */}
          {showResult && getCurrentQuestionResult() && (
            <div className={`mt-6 p-4 rounded-lg ${
              getCurrentQuestionResult()?.isCorrect 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <FaCheck className={getCurrentQuestionResult()?.isCorrect ? 'text-green-600' : 'text-red-600'} />
                <span className={`font-semibold ${
                  getCurrentQuestionResult()?.isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                }`}>
                  {getCurrentQuestionResult()?.isCorrect ? 'Chính xác!' : 'Sai rồi!'}
                </span>
              </div>
              <p className={`text-sm ${
                getCurrentQuestionResult()?.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {getCurrentQuestionResult()?.isCorrect 
                  ? 'Bạn đã trả lời đúng câu hỏi này.' 
                  : 'Đáp án của bạn chưa chính xác. Hãy xem lại đáp án đúng được đánh dấu màu xanh.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2"
            >
              <FaChevronLeft />
              Câu trước
            </Button>
            {showResult && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Điểm hiện tại: {getTotalScore()}/{getMaxScore()}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {(currentQuestion as any)?.type === 'matching_intro' ? (
              // For intro questions, just show next button
              <Button onClick={goToNextQuestion} className="flex items-center gap-2">
                Bắt đầu ghép đôi
                <FaChevronRight />
              </Button>
            ) : !showResult ? (
              <Button
                onClick={checkCurrentAnswer}
                className="flex items-center gap-2"
                disabled={
                  // For multiple choice - check if answer is selected
                  (currentQuestion && 'question_text' in currentQuestion && !userAnswers.find(a => {
                    const currentQuestionId = currentQuestion.question_id;
                    return a.questionId === currentQuestionId;
                  })) ||
                  // For matching - check if pairs are matched
                  (currentQuestion && currentQuestion.type === 'matching' && matchingPairs.length === 0)
                }
              >
                <FaCheck />
                Kiểm tra đáp án
              </Button>
            ) : (
              !isLastQuestion ? (
                <Button onClick={goToNextQuestion} className="flex items-center gap-2">
                  Câu tiếp theo
                  <FaChevronRight />
                </Button>
              ) : (
                <Button
                  onClick={handleShowFinalSummary}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <FaTrophy />
                  Xem kết quả ({getTotalScore()}/{getMaxScore()} điểm)
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPracticeModal;
