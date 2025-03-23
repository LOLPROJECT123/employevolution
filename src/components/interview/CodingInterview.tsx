
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { MicIcon, VideoIcon, MonitorIcon, StopCircleIcon, PlayIcon, RefreshCwIcon } from "lucide-react";

const CODING_PROBLEMS = [
  {
    company: "Google",
    problems: [
      {
        id: "google-1",
        title: "Two Sum",
        difficulty: "Easy",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        example: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
        solution: "function twoSum(nums, target) {\n  const map = new Map();\n  \n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    \n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    \n    map.set(nums[i], i);\n  }\n  \n  return [];\n}"
      },
      {
        id: "google-2",
        title: "Valid Parentheses",
        difficulty: "Easy",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order. Every close bracket has a corresponding open bracket of the same type.",
        example: "Input: s = '()[]{}'\nOutput: true\n\nInput: s = '([)]'\nOutput: false",
        solution: "function isValid(s) {\n  const stack = [];\n  const map = {\n    '(': ')',\n    '[': ']',\n    '{': '}'\n  };\n  \n  for (let i = 0; i < s.length; i++) {\n    if (s[i] === '(' || s[i] === '[' || s[i] === '{') {\n      stack.push(s[i]);\n    } else {\n      const last = stack.pop();\n      \n      if (s[i] !== map[last]) {\n        return false;\n      }\n    }\n  }\n  \n  return stack.length === 0;\n}"
      },
      {
        id: "google-3",
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        description: "Given a string s, find the length of the longest substring without repeating characters.",
        example: "Input: s = 'abcabcbb'\nOutput: 3\nExplanation: The answer is 'abc', with the length of 3.",
        solution: "function lengthOfLongestSubstring(s) {\n  const charMap = new Map();\n  let maxLength = 0;\n  let start = 0;\n  \n  for (let end = 0; end < s.length; end++) {\n    const currentChar = s[end];\n    \n    if (charMap.has(currentChar)) {\n      start = Math.max(charMap.get(currentChar) + 1, start);\n    }\n    \n    charMap.set(currentChar, end);\n    maxLength = Math.max(maxLength, end - start + 1);\n  }\n  \n  return maxLength;\n}"
      },
      {
        id: "google-4",
        title: "Merge Intervals",
        difficulty: "Medium",
        description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        example: "Input: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]\nExplanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].",
        solution: "function merge(intervals) {\n  if (intervals.length <= 1) return intervals;\n  \n  // Sort intervals by starting time\n  intervals.sort((a, b) => a[0] - b[0]);\n  \n  const result = [intervals[0]];\n  \n  for (let i = 1; i < intervals.length; i++) {\n    const current = intervals[i];\n    const last = result[result.length - 1];\n    \n    // If current interval overlaps with the last result interval\n    if (current[0] <= last[1]) {\n      // Merge them by updating the end of the last interval\n      last[1] = Math.max(last[1], current[1]);\n    } else {\n      // Not overlapping, add the interval to result\n      result.push(current);\n    }\n  }\n  \n  return result;\n}"
      }
    ]
  },
  {
    company: "Amazon",
    problems: [
      {
        id: "amazon-1",
        title: "Number of Islands",
        difficulty: "Medium",
        description: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.",
        example: "Input: grid = [\n  ['1','1','1','1','0'],\n  ['1','1','0','1','0'],\n  ['1','1','0','0','0'],\n  ['0','0','0','0','0']\n]\nOutput: 1",
        solution: "function numIslands(grid) {\n  if (!grid || grid.length === 0) return 0;\n  \n  const rows = grid.length;\n  const cols = grid[0].length;\n  let count = 0;\n  \n  function dfs(r, c) {\n    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] === '0') {\n      return;\n    }\n    \n    grid[r][c] = '0'; // Mark as visited\n    \n    dfs(r + 1, c);\n    dfs(r - 1, c);\n    dfs(r, c + 1);\n    dfs(r, c - 1);\n  }\n  \n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (grid[r][c] === '1') {\n        count++;\n        dfs(r, c);\n      }\n    }\n  }\n  \n  return count;\n}"
      },
      {
        id: "amazon-2",
        title: "LRU Cache",
        difficulty: "Medium",
        description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class: LRUCache(int capacity) Initialize the LRU cache with positive size capacity. int get(int key) Return the value of the key if the key exists, otherwise return -1. void put(int key, int value) Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, evict the least recently used key.",
        example: "Input:\n['LRUCache', 'put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get']\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]\nOutput:\n[null, null, null, 1, null, -1, null, -1, 3, 4]",
        solution: "class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n  \n  get(key) {\n    if (!this.cache.has(key)) return -1;\n    \n    const value = this.cache.get(key);\n    this.cache.delete(key);\n    this.cache.set(key, value);\n    return value;\n  }\n  \n  put(key, value) {\n    this.cache.delete(key);\n    \n    if (this.cache.size === this.capacity) {\n      const firstKey = this.cache.keys().next().value;\n      this.cache.delete(firstKey);\n    }\n    \n    this.cache.set(key, value);\n  }\n}"
      },
      {
        id: "amazon-3",
        title: "Trapping Rain Water",
        difficulty: "Hard",
        description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        example: "Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6\nExplanation: The elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.",
        solution: "function trap(height) {\n  if (height.length === 0) return 0;\n  \n  let left = 0;\n  let right = height.length - 1;\n  let leftMax = height[left];\n  let rightMax = height[right];\n  let water = 0;\n  \n  while (left < right) {\n    if (leftMax < rightMax) {\n      left++;\n      leftMax = Math.max(leftMax, height[left]);\n      water += leftMax - height[left];\n    } else {\n      right--;\n      rightMax = Math.max(rightMax, height[right]);\n      water += rightMax - height[right];\n    }\n  }\n  \n  return water;\n}"
      },
      {
        id: "amazon-4",
        title: "Merge K Sorted Lists",
        difficulty: "Hard",
        description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
        example: "Input: lists = [[1,4,5],[1,3,4],[2,6]]\nOutput: [1,1,2,3,4,4,5,6]\nExplanation: The linked-lists are:\n[\n  1->4->5,\n  1->3->4,\n  2->6\n]\nmerging them into one sorted list:\n1->1->2->3->4->4->5->6",
        solution: "/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\nfunction mergeKLists(lists) {\n  if (lists.length === 0) return null;\n  \n  const mergeTwoLists = (l1, l2) => {\n    const dummy = new ListNode(0);\n    let current = dummy;\n    \n    while (l1 && l2) {\n      if (l1.val < l2.val) {\n        current.next = l1;\n        l1 = l1.next;\n      } else {\n        current.next = l2;\n        l2 = l2.next;\n      }\n      current = current.next;\n    }\n    \n    current.next = l1 || l2;\n    return dummy.next;\n  };\n  \n  // Divide and conquer approach\n  while (lists.length > 1) {\n    const mergedLists = [];\n    \n    for (let i = 0; i < lists.length; i += 2) {\n      const l1 = lists[i];\n      const l2 = i + 1 < lists.length ? lists[i + 1] : null;\n      mergedLists.push(mergeTwoLists(l1, l2));\n    }\n    \n    lists = mergedLists;\n  }\n  \n  return lists[0] || null;\n}"
      }
    ]
  },
  {
    company: "Facebook",
    problems: [
      {
        id: "facebook-1",
        title: "Valid Palindrome",
        difficulty: "Easy",
        description: "Given a string s, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases. A palindrome is a word, phrase, number, or other sequence of characters that reads the same forward and backward.",
        example: "Input: s = 'A man, a plan, a canal: Panama'\nOutput: true\nExplanation: 'amanaplanacanalpanama' is a palindrome.",
        solution: "function isPalindrome(s) {\n  s = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  \n  let left = 0;\n  let right = s.length - 1;\n  \n  while (left < right) {\n    if (s[left] !== s[right]) {\n      return false;\n    }\n    \n    left++;\n    right--;\n  }\n  \n  return true;\n}"
      },
      {
        id: "facebook-2",
        title: "Binary Tree Level Order Traversal",
        difficulty: "Medium",
        description: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
        example: "Input: root = [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]",
        solution: "function levelOrder(root) {\n  if (!root) return [];\n  \n  const result = [];\n  const queue = [root];\n  \n  while (queue.length > 0) {\n    const level = [];\n    const levelSize = queue.length;\n    \n    for (let i = 0; i < levelSize; i++) {\n      const node = queue.shift();\n      level.push(node.val);\n      \n      if (node.left) queue.push(node.left);\n      if (node.right) queue.push(node.right);\n    }\n    \n    result.push(level);\n  }\n  \n  return result;\n}"
      },
      {
        id: "facebook-3",
        title: "Add Two Numbers",
        difficulty: "Medium",
        description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
        example: "Input: l1 = [2,4,3], l2 = [5,6,4]\nOutput: [7,0,8]\nExplanation: 342 + 465 = 807.",
        solution: "/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\nfunction addTwoNumbers(l1, l2) {\n  const dummy = new ListNode(0);\n  let current = dummy;\n  let carry = 0;\n  \n  while (l1 || l2 || carry) {\n    const val1 = l1 ? l1.val : 0;\n    const val2 = l2 ? l2.val : 0;\n    \n    // Calculate sum and carry\n    const sum = val1 + val2 + carry;\n    carry = Math.floor(sum / 10);\n    \n    // Create new node with ones digit of sum\n    current.next = new ListNode(sum % 10);\n    current = current.next;\n    \n    // Move to next nodes if they exist\n    if (l1) l1 = l1.next;\n    if (l2) l2 = l2.next;\n  }\n  \n  return dummy.next;\n}"
      },
      {
        id: "facebook-4",
        title: "Minimum Remove to Make Valid Parentheses",
        difficulty: "Medium",
        description: "Given a string s of '(' , ')' and lowercase English characters. Your task is to remove the minimum number of parentheses ( '(' or ')', in any positions ) so that the resulting parentheses string is valid and return any valid string.",
        example: "Input: s = 'lee(t(c)o)de)'\nOutput: 'lee(t(c)o)de'\nExplanation: 'lee(t(co)de)' , 'lee(t(c)ode)' would also be accepted.",
        solution: "function minRemoveToMakeValid(s) {\n  const result = s.split('');\n  const stack = [];\n  \n  // Mark invalid closing parentheses\n  for (let i = 0; i < result.length; i++) {\n    if (result[i] === '(') {\n      stack.push(i);\n    } else if (result[i] === ')') {\n      if (stack.length) {\n        stack.pop();\n      } else {\n        result[i] = '';\n      }\n    }\n  }\n  \n  // Mark any remaining opening parentheses\n  for (let i of stack) {\n    result[i] = '';\n  }\n  \n  return result.join('');\n}"
      }
    ]
  },
  {
    company: "Microsoft",
    problems: [
      {
        id: "microsoft-1",
        title: "Reverse String",
        difficulty: "Easy",
        description: "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
        example: "Input: s = ['h','e','l','l','o']\nOutput: ['o','l','l','e','h']",
        solution: "function reverseString(s) {\n  let left = 0;\n  let right = s.length - 1;\n  \n  while (left < right) {\n    // Swap characters\n    [s[left], s[right]] = [s[right], s[left]];\n    left++;\n    right--;\n  }\n  \n  return s;\n}"
      },
      {
        id: "microsoft-2",
        title: "Longest Palindromic Substring",
        difficulty: "Medium",
        description: "Given a string s, return the longest palindromic substring in s.",
        example: "Input: s = 'babad'\nOutput: 'bab'\nNote: 'aba' is also a valid answer.",
        solution: "function longestPalindrome(s) {\n  if (!s || s.length < 1) return '';\n  \n  let start = 0;\n  let end = 0;\n  \n  for (let i = 0; i < s.length; i++) {\n    // Expand around center for odd length palindromes\n    const len1 = expandAroundCenter(s, i, i);\n    // Expand around center for even length palindromes\n    const len2 = expandAroundCenter(s, i, i + 1);\n    const len = Math.max(len1, len2);\n    \n    if (len > end - start) {\n      start = i - Math.floor((len - 1) / 2);\n      end = i + Math.floor(len / 2);\n    }\n  }\n  \n  return s.substring(start, end + 1);\n}\n\nfunction expandAroundCenter(s, left, right) {\n  while (left >= 0 && right < s.length && s[left] === s[right]) {\n    left--;\n    right++;\n  }\n  \n  return right - left - 1;\n}"
      },
      {
        id: "microsoft-3",
        title: "Merge Sorted Array",
        difficulty: "Easy",
        description: "You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively. Merge nums1 and nums2 into a single array sorted in non-decreasing order. The final sorted array should be stored inside nums1. To accommodate this, nums1 has a length of m + n, where the first m elements denote the elements that should be merged, and the last n elements are set to 0 and should be ignored. nums2 has a length of n.",
        example: "Input: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3\nOutput: [1,2,2,3,5,6]\nExplanation: The arrays we are merging are [1,2,3] and [2,5,6]. The result of the merge is [1,2,2,3,5,6].",
        solution: "function merge(nums1, m, nums2, n) {\n  let i = m - 1;\n  let j = n - 1;\n  let k = m + n - 1;\n  \n  // Start from the end and work backwards\n  while (j >= 0) {\n    if (i >= 0 && nums1[i] > nums2[j]) {\n      nums1[k--] = nums1[i--];\n    } else {\n      nums1[k--] = nums2[j--];\n    }\n  }\n  \n  return nums1;\n}"
      },
      {
        id: "microsoft-4",
        title: "Construct Binary Tree from Preorder and Inorder Traversal",
        difficulty: "Medium",
        description: "Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree.",
        example: "Input: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]\nOutput: [3,9,20,null,null,15,7]",
        solution: "/**\n * Definition for a binary tree node.\n * function TreeNode(val, left, right) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.left = (left===undefined ? null : left)\n *     this.right = (right===undefined ? null : right)\n * }\n */\nfunction buildTree(preorder, inorder) {\n  if (preorder.length === 0 || inorder.length === 0) return null;\n  \n  // First element in preorder is the root\n  const rootVal = preorder[0];\n  const root = new TreeNode(rootVal);\n  \n  // Find the position of root value in inorder array\n  const mid = inorder.indexOf(rootVal);\n  \n  // Recursively construct left and right subtrees\n  // Left subtree: elements before root in inorder\n  // Right subtree: elements after root in inorder\n  root.left = buildTree(\n    preorder.slice(1, mid + 1),\n    inorder.slice(0, mid)\n  );\n  \n  root.right = buildTree(\n    preorder.slice(mid + 1),\n    inorder.slice(mid + 1)\n  );\n  \n  return root;\n}"
      }
    ]
  }
];

interface RecordingPermissions {
  camera: boolean;
  microphone: boolean;
  screen: boolean;
}

const CodingInterview = () => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>("Google");
  const [selectedProblem, setSelectedProblem] = useState<string>("");
  const [currentTab, setCurrentTab] = useState<string>("problem");
  const [code, setCode] = useState<string>("");
  const [showSolution, setShowSolution] = useState(false);
  const [permissions, setPermissions] = useState<RecordingPermissions>({
    camera: false,
    microphone: false,
    screen: false,
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Reset problem selection when company changes
  useEffect(() => {
    const companyProblems = CODING_PROBLEMS.find(c => c.company === selectedCompany)?.problems || [];
    if (companyProblems.length > 0) {
      setSelectedProblem(companyProblems[0].id);
      setCode("// Write your solution here\n\n");
      setShowSolution(false);
    }
  }, [selectedCompany]);
  
  // Get current problem details
  const getCurrentProblem = () => {
    for (const company of CODING_PROBLEMS) {
      const problem = company.problems.find(p => p.id === selectedProblem);
      if (problem) return problem;
    }
    return null;
  };
  
  const currentProblem = getCurrentProblem();
  
  // Get permission status for media devices
  const checkPermissions = async () => {
    try {
      // Check camera and microphone
      const mediaPermission = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });
      const micPermission = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      
      setPermissions(prev => ({
        ...prev,
        camera: mediaPermission.state === "granted",
        microphone: micPermission.state === "granted",
      }));
    } catch (error) {
      console.error("Error checking permissions:", error);
    }
  };
  
  useEffect(() => {
    checkPermissions();
  }, []);
  
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      streamRef.current = mediaStream;
      setPermissions(prev => ({
        ...prev,
        camera: true,
        microphone: true,
      }));
      
      toast({
        title: "Camera and microphone access granted",
        description: "You're ready to start the interview!",
      });
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast({
        title: "Permission denied",
        description: "Please allow camera and microphone access to use this feature.",
        variant: "destructive",
      });
    }
  };
  
  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      
      // Combine screen and camera streams
      if (streamRef.current) {
        const tracks = [...streamRef.current.getTracks(), ...screenStream.getTracks()];
        streamRef.current = new MediaStream(tracks);
      } else {
        streamRef.current = screenStream;
      }
      
      setPermissions(prev => ({
        ...prev,
        screen: true,
      }));
      
      toast({
        title: "Screen sharing started",
        description: "Your screen is now being shared.",
      });
    } catch (error) {
      console.error("Error sharing screen:", error);
      toast({
        title: "Screen sharing denied",
        description: "Please allow screen sharing to use this feature.",
        variant: "destructive",
      });
    }
  };
  
  const startRecording = () => {
    if (!streamRef.current) {
      toast({
        title: "No media stream available",
        description: "Please enable camera and microphone first.",
        variant: "destructive",
      });
      return;
    }
    
    const mediaRecorder = new MediaRecorder(streamRef.current);
    const chunks: BlobPart[] = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `coding-interview-${selectedCompany}-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setIsRecording(false);
      setPermissions({
        camera: false,
        microphone: false,
        screen: false,
      });
      
      toast({
        title: "Recording saved",
        description: "Your coding interview recording has been saved.",
      });
    }
  };
  
  const prepareInterview = () => {
    setIsPreparing(true);
  };
  
  const startInterview = async () => {
    await startCamera();
    setIsPreparing(false);
    startRecording();
  };
  
  const resetProblem = () => {
    setCode("// Write your solution here\n\n");
    setShowSolution(false);
    
    toast({
      title: "Problem reset",
      description: "Your code has been reset.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Coding Interview Practice</CardTitle>
          <CardDescription>
            Solve real coding problems from top tech companies with screen and camera recording.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="space-y-4 md:col-span-3">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label htmlFor="company" className="text-sm font-medium block mb-2">Company</label>
                  <Select
                    value={selectedCompany}
                    onValueChange={setSelectedCompany}
                    disabled={isRecording}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {CODING_PROBLEMS.map((company) => (
                        <SelectItem key={company.company} value={company.company}>
                          {company.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <label htmlFor="problem" className="text-sm font-medium block mb-2">Problem</label>
                  <Select
                    value={selectedProblem}
                    onValueChange={setSelectedProblem}
                    disabled={isRecording}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select problem" />
                    </SelectTrigger>
                    <SelectContent>
                      {CODING_PROBLEMS.find(c => c.company === selectedCompany)?.problems.map((problem) => (
                        <SelectItem key={problem.id} value={problem.id}>
                          {problem.title} ({problem.difficulty})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="problem">Problem</TabsTrigger>
                  <TabsTrigger value="solution" disabled={!showSolution}>Solution</TabsTrigger>
                </TabsList>
                
                <TabsContent value="problem" className="space-y-4">
                  {currentProblem && (
                    <>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">{currentProblem.title}</h3>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          currentProblem.difficulty === 'Easy' 
                            ? 'bg-green-100 text-green-800' 
                            : currentProblem.difficulty === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {currentProblem.difficulty}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Description:</h4>
                        <p className="text-sm whitespace-pre-line">{currentProblem.description}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Example:</h4>
                        <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                          {currentProblem.example}
                        </pre>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Your Solution:</h4>
                        <textarea
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          disabled={isRecording}
                          className="w-full min-h-[300px] font-mono text-sm p-3 border rounded-md"
                          spellCheck="false"
                        />
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="solution">
                  {currentProblem && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Solution for {currentProblem.title}</h3>
                      <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                        {currentProblem.solution}
                      </pre>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-4 md:col-span-2">
              <div className="border rounded-md overflow-hidden bg-black aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                ></video>
                {!isRecording && !permissions.camera && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-white text-sm">Camera preview will appear here</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startCamera}
                  disabled={isRecording || permissions.camera}
                  className="flex-1"
                >
                  <VideoIcon className="mr-2 h-4 w-4" />
                  Enable Camera
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareScreen}
                  disabled={isRecording || permissions.screen}
                  className="flex-1"
                >
                  <MonitorIcon className="mr-2 h-4 w-4" />
                  Share Screen
                </Button>
              </div>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Interview Timer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-2">
                    <span className="text-3xl font-mono">
                      {isRecording ? "00:30:00" : "00:00:00"}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isRecording 
                        ? "Timer will start when recording begins" 
                        : "Recording in progress"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={resetProblem}
              disabled={isRecording}
            >
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Reset
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowSolution(true)}
              disabled={isRecording || showSolution}
            >
              Show Solution
            </Button>
          </div>
          
          {!isRecording ? (
            <Button
              onClick={prepareInterview}
              className="bg-[#F97316] hover:bg-[#F97316]/90 text-white"
            >
              <PlayIcon className="mr-2 h-4 w-4" />
              Begin Interview
            </Button>
          ) : (
            <Button onClick={stopRecording} variant="destructive">
              <StopCircleIcon className="mr-2 h-4 w-4" />
              End Interview
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Preparation Dialog */}
      <Dialog open={isPreparing} onOpenChange={setIsPreparing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prepare for Your Coding Interview</DialogTitle>
            <DialogDescription>
              We'll need access to your camera, microphone, and screen to simulate a real interview environment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${permissions.camera ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                <VideoIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Camera Access</h4>
                <p className="text-sm text-muted-foreground">
                  {permissions.camera ? 'Granted' : 'Required to see yourself during the interview'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${permissions.microphone ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                <MicIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Microphone Access</h4>
                <p className="text-sm text-muted-foreground">
                  {permissions.microphone ? 'Granted' : 'Required to record your explanations'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${permissions.screen ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                <MonitorIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Screen Sharing</h4>
                <p className="text-sm text-muted-foreground">
                  {permissions.screen ? 'Granted' : 'Required to show your coding environment'}
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreparing(false)}>
              Cancel
            </Button>
            <Button onClick={startInterview} className="bg-[#F97316] hover:bg-[#F97316]/90 text-white">
              Start Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CodingInterview;
