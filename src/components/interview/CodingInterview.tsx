
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
    category: "Arrays & Hashing",
    problems: [
      {
        id: "array-1",
        title: "Two Sum",
        difficulty: "Easy",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        example: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
        solution: "function twoSum(nums, target) {\n  const map = new Map();\n  \n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    \n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    \n    map.set(nums[i], i);\n  }\n  \n  return [];\n}"
      },
      {
        id: "array-2",
        title: "Contains Duplicate",
        difficulty: "Easy",
        description: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
        example: "Input: nums = [1,2,3,1]\nOutput: true\nInput: nums = [1,2,3,4]\nOutput: false",
        solution: "function containsDuplicate(nums) {\n  const seen = new Set();\n  \n  for (const num of nums) {\n    if (seen.has(num)) {\n      return true;\n    }\n    seen.add(num);\n  }\n  \n  return false;\n}"
      },
      {
        id: "array-3",
        title: "Product of Array Except Self",
        difficulty: "Medium",
        description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer. You must write an algorithm without using the division operation.",
        example: "Input: nums = [1,2,3,4]\nOutput: [24,12,8,6]",
        solution: "function productExceptSelf(nums) {\n  const n = nums.length;\n  const result = new Array(n).fill(1);\n  \n  // Calculate left products\n  let leftProduct = 1;\n  for (let i = 0; i < n; i++) {\n    result[i] = leftProduct;\n    leftProduct *= nums[i];\n  }\n  \n  // Calculate right products and multiply with left products\n  let rightProduct = 1;\n  for (let i = n - 1; i >= 0; i--) {\n    result[i] *= rightProduct;\n    rightProduct *= nums[i];\n  }\n  \n  return result;\n}"
      }
    ]
  },
  {
    category: "Two Pointers",
    problems: [
      {
        id: "tp-1",
        title: "Valid Palindrome",
        difficulty: "Easy",
        description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers. Given a string s, return true if it is a palindrome, or false otherwise.",
        example: "Input: s = 'A man, a plan, a canal: Panama'\nOutput: true\nExplanation: 'amanaplanacanalpanama' is a palindrome.",
        solution: "function isPalindrome(s) {\n  // Convert to lowercase and remove non-alphanumeric characters\n  s = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  \n  let left = 0;\n  let right = s.length - 1;\n  \n  while (left < right) {\n    if (s[left] !== s[right]) {\n      return false;\n    }\n    left++;\n    right--;\n  }\n  \n  return true;\n}"
      },
      {
        id: "tp-2",
        title: "3Sum",
        difficulty: "Medium",
        description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. Notice that the solution set must not contain duplicate triplets.",
        example: "Input: nums = [-1,0,1,2,-1,-4]\nOutput: [[-1,-1,2],[-1,0,1]]",
        solution: "function threeSum(nums) {\n  const result = [];\n  \n  // Sort the array\n  nums.sort((a, b) => a - b);\n  \n  for (let i = 0; i < nums.length - 2; i++) {\n    // Skip duplicates\n    if (i > 0 && nums[i] === nums[i - 1]) continue;\n    \n    let left = i + 1;\n    let right = nums.length - 1;\n    \n    while (left < right) {\n      const sum = nums[i] + nums[left] + nums[right];\n      \n      if (sum < 0) {\n        left++;\n      } else if (sum > 0) {\n        right--;\n      } else {\n        // Found a triplet\n        result.push([nums[i], nums[left], nums[right]]);\n        \n        // Skip duplicates\n        while (left < right && nums[left] === nums[left + 1]) left++;\n        while (left < right && nums[right] === nums[right - 1]) right--;\n        \n        left++;\n        right--;\n      }\n    }\n  }\n  \n  return result;\n}"
      },
      {
        id: "tp-3",
        title: "Container With Most Water",
        difficulty: "Medium",
        description: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
        example: "Input: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49\nExplanation: The vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water the container can contain is 49.",
        solution: "function maxArea(height) {\n  let maxWater = 0;\n  let left = 0;\n  let right = height.length - 1;\n  \n  while (left < right) {\n    // Calculate water amount\n    const h = Math.min(height[left], height[right]);\n    const w = right - left;\n    maxWater = Math.max(maxWater, h * w);\n    \n    // Move the pointer with the smaller height\n    if (height[left] < height[right]) {\n      left++;\n    } else {\n      right--;\n    }\n  }\n  \n  return maxWater;\n}"
      }
    ]
  },
  {
    category: "Sliding Window",
    problems: [
      {
        id: "sw-1",
        title: "Best Time to Buy and Sell Stock",
        difficulty: "Easy",
        description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
        example: "Input: prices = [7,1,5,3,6,4]\nOutput: 5\nExplanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.",
        solution: "function maxProfit(prices) {\n  let maxProfit = 0;\n  let minPrice = Infinity;\n  \n  for (let i = 0; i < prices.length; i++) {\n    if (prices[i] < minPrice) {\n      minPrice = prices[i];\n    } else if (prices[i] - minPrice > maxProfit) {\n      maxProfit = prices[i] - minPrice;\n    }\n  }\n  \n  return maxProfit;\n}"
      },
      {
        id: "sw-2",
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        description: "Given a string s, find the length of the longest substring without repeating characters.",
        example: "Input: s = 'abcabcbb'\nOutput: 3\nExplanation: The answer is 'abc', with the length of 3.",
        solution: "function lengthOfLongestSubstring(s) {\n  let maxLength = 0;\n  let start = 0;\n  const charMap = new Map();\n  \n  for (let end = 0; end < s.length; end++) {\n    const char = s[end];\n    \n    if (charMap.has(char) && charMap.get(char) >= start) {\n      start = charMap.get(char) + 1;\n    } else {\n      maxLength = Math.max(maxLength, end - start + 1);\n    }\n    \n    charMap.set(char, end);\n  }\n  \n  return maxLength;\n}"
      },
      {
        id: "sw-3",
        title: "Minimum Window Substring",
        difficulty: "Hard",
        description: "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string.",
        example: "Input: s = 'ADOBECODEBANC', t = 'ABC'\nOutput: 'BANC'\nExplanation: The minimum window substring 'BANC' includes 'A', 'B', and 'C' from string t.",
        solution: "function minWindow(s, t) {\n  if (s.length === 0 || t.length === 0 || s.length < t.length) {\n    return '';\n  }\n\n  // Count characters in t\n  const targetMap = new Map();\n  for (const char of t) {\n    targetMap.set(char, (targetMap.get(char) || 0) + 1);\n  }\n\n  let left = 0;\n  let right = 0;\n  let formed = 0;\n  const required = targetMap.size;\n  const windowCounts = new Map();\n  let minLen = Infinity;\n  let minLenStart = 0;\n\n  while (right < s.length) {\n    // Add one character from the right to the window\n    const rightChar = s[right];\n    windowCounts.set(rightChar, (windowCounts.get(rightChar) || 0) + 1);\n\n    // Check if this character satisfies a requirement\n    if (targetMap.has(rightChar) && windowCounts.get(rightChar) === targetMap.get(rightChar)) {\n      formed++;\n    }\n\n    // Try to contract the window from the left\n    while (left <= right && formed === required) {\n      // Update result if this window is smaller\n      if (right - left + 1 < minLen) {\n        minLen = right - left + 1;\n        minLenStart = left;\n      }\n\n      // Remove the leftmost character\n      const leftChar = s[left];\n      windowCounts.set(leftChar, windowCounts.get(leftChar) - 1);\n\n      // Check if this character was part of the requirements\n      if (targetMap.has(leftChar) && windowCounts.get(leftChar) < targetMap.get(leftChar)) {\n        formed--;\n      }\n\n      left++;\n    }\n\n    right++;\n  }\n\n  return minLen === Infinity ? '' : s.substring(minLenStart, minLenStart + minLen);\n}"
      }
    ]
  },
  {
    category: "Stack",
    problems: [
      {
        id: "stack-1",
        title: "Valid Parentheses",
        difficulty: "Easy",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order. Every close bracket has a corresponding open bracket of the same type.",
        example: "Input: s = '()[]{}'\nOutput: true\nInput: s = '([)]'\nOutput: false",
        solution: "function isValid(s) {\n  const stack = [];\n  const map = {\n    '(': ')',\n    '[': ']',\n    '{': '}'\n  };\n  \n  for (let i = 0; i < s.length; i++) {\n    const char = s[i];\n    \n    if (char in map) {\n      // If opening bracket, push to stack\n      stack.push(char);\n    } else {\n      // If closing bracket\n      const last = stack.pop();\n      \n      // Check if matches corresponding opening bracket\n      if (map[last] !== char) {\n        return false;\n      }\n    }\n  }\n  \n  // Stack should be empty if all brackets are matched\n  return stack.length === 0;\n}"
      },
      {
        id: "stack-2",
        title: "Min Stack",
        difficulty: "Medium",
        description: "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time. Implement the MinStack class: MinStack() initializes the stack object. void push(int val) pushes the element val onto the stack. void pop() removes the element on the top of the stack. int top() gets the top element of the stack. int getMin() retrieves the minimum element in the stack.",
        example: "Input:\n['MinStack', 'push', 'push', 'push', 'getMin', 'pop', 'top', 'getMin']\n[[], [-2], [0], [-3], [], [], [], []]\nOutput:\n[null, null, null, null, -3, null, 0, -2]",
        solution: "class MinStack {\n  constructor() {\n    this.stack = [];\n    this.minStack = [];\n  }\n  \n  push(val) {\n    this.stack.push(val);\n    \n    // Update min stack\n    if (this.minStack.length === 0 || val <= this.minStack[this.minStack.length - 1]) {\n      this.minStack.push(val);\n    }\n  }\n  \n  pop() {\n    const val = this.stack.pop();\n    \n    // If we're removing the current minimum, update minStack\n    if (val === this.minStack[this.minStack.length - 1]) {\n      this.minStack.pop();\n    }\n  }\n  \n  top() {\n    return this.stack[this.stack.length - 1];\n  }\n  \n  getMin() {\n    return this.minStack[this.minStack.length - 1];\n  }\n}"
      },
      {
        id: "stack-3",
        title: "Daily Temperatures",
        difficulty: "Medium",
        description: "Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day for which this is possible, keep answer[i] == 0 instead.",
        example: "Input: temperatures = [73,74,75,71,69,72,76,73]\nOutput: [1,1,4,2,1,1,0,0]",
        solution: "function dailyTemperatures(temperatures) {\n  const n = temperatures.length;\n  const result = new Array(n).fill(0);\n  const stack = [];\n  \n  for (let i = 0; i < n; i++) {\n    // While current temperature is warmer than temperatures at indices in the stack\n    while (stack.length > 0 && temperatures[i] > temperatures[stack[stack.length - 1]]) {\n      const prevIdx = stack.pop();\n      result[prevIdx] = i - prevIdx;\n    }\n    \n    // Push current index to stack\n    stack.push(i);\n  }\n  \n  return result;\n}"
      }
    ]
  },
  {
    category: "Binary Search",
    problems: [
      {
        id: "bs-1",
        title: "Binary Search",
        difficulty: "Easy",
        description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.",
        example: "Input: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4\nExplanation: 9 exists in nums and its index is 4",
        solution: "function search(nums, target) {\n  let left = 0;\n  let right = nums.length - 1;\n  \n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    \n    if (nums[mid] === target) {\n      return mid;\n    } else if (nums[mid] < target) {\n      left = mid + 1;\n    } else {\n      right = mid - 1;\n    }\n  }\n  \n  return -1;\n}"
      },
      {
        id: "bs-2",
        title: "Search in Rotated Sorted Array",
        difficulty: "Medium",
        description: "There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index k (1 <= k < nums.length) such that the resulting array is [nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]] (0-indexed). For example, [0,1,2,4,5,6,7] might be rotated at pivot index 3 and become [4,5,6,7,0,1,2]. Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.",
        example: "Input: nums = [4,5,6,7,0,1,2], target = 0\nOutput: 4",
        solution: "function search(nums, target) {\n  let left = 0;\n  let right = nums.length - 1;\n  \n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    \n    if (nums[mid] === target) {\n      return mid;\n    }\n    \n    // Check if left side is sorted\n    if (nums[left] <= nums[mid]) {\n      // Check if target is in left sorted portion\n      if (nums[left] <= target && target < nums[mid]) {\n        right = mid - 1;\n      } else {\n        left = mid + 1;\n      }\n    } else {\n      // Right side is sorted\n      // Check if target is in right sorted portion\n      if (nums[mid] < target && target <= nums[right]) {\n        left = mid + 1;\n      } else {\n        right = mid - 1;\n      }\n    }\n  }\n  \n  return -1;\n}"
      },
      {
        id: "bs-3",
        title: "Find Minimum in Rotated Sorted Array",
        difficulty: "Medium",
        description: "Suppose an array of length n sorted in ascending order is rotated between 1 and n times. For example, the array nums = [0,1,2,4,5,6,7] might become: [4,5,6,7,0,1,2] if it was rotated 4 times. [0,1,2,4,5,6,7] if it was rotated 7 times. Notice that rotating an array [a[0], a[1], a[2], ..., a[n-1]] 1 time results in the array [a[n-1], a[0], a[1], a[2], ..., a[n-2]]. Given the sorted rotated array nums of unique elements, return the minimum element of this array.",
        example: "Input: nums = [3,4,5,1,2]\nOutput: 1\nExplanation: The original array was [1,2,3,4,5] rotated 3 times.",
        solution: "function findMin(nums) {\n  let left = 0;\n  let right = nums.length - 1;\n  \n  // If array is not rotated\n  if (nums[left] < nums[right]) {\n    return nums[0];\n  }\n  \n  while (left < right) {\n    const mid = Math.floor((left + right) / 2);\n    \n    // Check if mid element is the minimum\n    if (mid > 0 && nums[mid] < nums[mid - 1]) {\n      return nums[mid];\n    }\n    \n    // Decide which half to search\n    if (nums[mid] >= nums[left] && nums[mid] > nums[right]) {\n      // Minimum is in the right half\n      left = mid + 1;\n    } else {\n      // Minimum is in the left half (including mid)\n      right = mid;\n    }\n  }\n  \n  // When left and right converge\n  return nums[left];\n}"
      }
    ]
  },
  {
    category: "Linked List",
    problems: [
      {
        id: "ll-1",
        title: "Reverse Linked List",
        difficulty: "Easy",
        description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        example: "Input: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]",
        solution: "/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\nfunction reverseList(head) {\n  let prev = null;\n  let current = head;\n  \n  while (current !== null) {\n    // Save next node\n    const next = current.next;\n    \n    // Reverse pointer\n    current.next = prev;\n    \n    // Move pointers forward\n    prev = current;\n    current = next;\n  }\n  \n  return prev;\n}"
      },
      {
        id: "ll-2",
        title: "Merge Two Sorted Lists",
        difficulty: "Easy",
        description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
        example: "Input: list1 = [1,2,4], list2 = [1,3,4]\nOutput: [1,1,2,3,4,4]",
        solution: "/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\nfunction mergeTwoLists(list1, list2) {\n  // Create dummy head to simplify edge cases\n  const dummy = new ListNode(-1);\n  let current = dummy;\n  \n  while (list1 !== null && list2 !== null) {\n    if (list1.val < list2.val) {\n      current.next = list1;\n      list1 = list1.next;\n    } else {\n      current.next = list2;\n      list2 = list2.next;\n    }\n    current = current.next;\n  }\n  \n  // Attach remaining nodes\n  current.next = list1 !== null ? list1 : list2;\n  \n  return dummy.next;\n}"
      },
      {
        id: "ll-3",
        title: "Remove Nth Node From End of List",
        difficulty: "Medium",
        description: "Given the head of a linked list, remove the nth node from the end of the list and return its head.",
        example: "Input: head = [1,2,3,4,5], n = 2\nOutput: [1,2,3,5]",
        solution: "/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\nfunction removeNthFromEnd(head, n) {\n  // Create dummy head to handle edge cases\n  const dummy = new ListNode(0);\n  dummy.next = head;\n  \n  let first = dummy;\n  let second = dummy;\n  \n  // Advance first pointer n+1 steps\n  for (let i = 0; i <= n; i++) {\n    first = first.next;\n  }\n  \n  // Move both pointers until first reaches the end\n  while (first !== null) {\n    first = first.next;\n    second = second.next;\n  }\n  \n  // Remove the nth node\n  second.next = second.next.next;\n  \n  return dummy.next;\n}"
      }
    ]
  },
  {
    category: "Trees",
    problems: [
      {
        id: "tree-1",
        title: "Maximum Depth of Binary Tree",
        difficulty: "Easy",
        description: "Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
        example: "Input: root = [3,9,20,null,null,15,7]\nOutput: 3",
        solution: "/**\n * Definition for a binary tree node.\n * function TreeNode(val, left, right) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.left = (left===undefined ? null : left)\n *     this.right = (right===undefined ? null : right)\n * }\n */\nfunction maxDepth(root) {\n  if (root === null) {\n    return 0;\n  }\n  \n  const leftDepth = maxDepth(root.left);\n  const rightDepth = maxDepth(root.right);\n  \n  return Math.max(leftDepth, rightDepth) + 1;\n}"
      },
      {
        id: "tree-2",
        title: "Validate Binary Search Tree",
        difficulty: "Medium",
        description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST is defined as follows: The left subtree of a node contains only nodes with keys less than the node's key. The right subtree of a node contains only nodes with keys greater than the node's key. Both the left and right subtrees must also be binary search trees.",
        example: "Input: root = [2,1,3]\nOutput: true\nInput: root = [5,1,4,null,null,3,6]\nOutput: false",
        solution: "/**\n * Definition for a binary tree node.\n * function TreeNode(val, left, right) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.left = (left===undefined ? null : left)\n *     this.right = (right===undefined ? null : right)\n * }\n */\nfunction isValidBST(root) {\n  function validate(node, min, max) {\n    if (node === null) {\n      return true;\n    }\n    \n    // Check current node's value\n    if ((min !== null && node.val <= min) || (max !== null && node.val >= max)) {\n      return false;\n    }\n    \n    // Recursively check subtrees\n    return validate(node.left, min, node.val) && validate(node.right, node.val, max);\n  }\n  \n  return validate(root, null, null);\n}"
      },
      {
        id: "tree-3",
        title: "Binary Tree Level Order Traversal",
        difficulty: "Medium",
        description: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
        example: "Input: root = [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]",
        solution: "/**\n * Definition for a binary tree node.\n * function TreeNode(val, left, right) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.left = (left===undefined ? null : left)\n *     this.right = (right===undefined ? null : right)\n * }\n */\nfunction levelOrder(root) {\n  if (!root) return [];\n  \n  const result = [];\n  const queue = [root];\n  \n  while (queue.length > 0) {\n    const levelSize = queue.length;\n    const currentLevel = [];\n    \n    for (let i = 0; i < levelSize; i++) {\n      const node = queue.shift();\n      currentLevel.push(node.val);\n      \n      if (node.left) queue.push(node.left);\n      if (node.right) queue.push(node.right);\n    }\n    \n    result.push(currentLevel);\n  }\n  \n  return result;\n}"
      }
    ]
  },
  {
    category: "Dynamic Programming",
    problems: [
      {
        id: "dp-1",
        title: "Climbing Stairs",
        difficulty: "Easy",
        description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        example: "Input: n = 3\nOutput: 3\nExplanation: There are three ways to climb to the top.\n1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step",
        solution: "function climbStairs(n) {\n  if (n <= 2) return n;\n  \n  // Initialize base cases\n  let oneStepBefore = 2; // Ways to climb 2 stairs\n  let twoStepsBefore = 1; // Ways to climb 1 stair\n  let allWays = 0;\n  \n  // Start from step 3 and calculate ways for each step\n  for (let i = 3; i <= n; i++) {\n    allWays = oneStepBefore + twoStepsBefore;\n    twoStepsBefore = oneStepBefore;\n    oneStepBefore = allWays;\n  }\n  \n  return allWays;\n}"
      },
      {
        id: "dp-2",
        title: "House Robber",
        difficulty: "Medium",
        description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night. Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
        example: "Input: nums = [1,2,3,1]\nOutput: 4\nExplanation: Rob house 1 (money = 1) and then rob house 3 (money = 3). Total amount you can rob = 1 + 3 = 4.",
        solution: "function rob(nums) {\n  if (nums.length === 0) return 0;\n  if (nums.length === 1) return nums[0];\n  \n  // Initialize max amounts at each house\n  const dp = new Array(nums.length);\n  dp[0] = nums[0];\n  dp[1] = Math.max(nums[0], nums[1]);\n  \n  for (let i = 2; i < nums.length; i++) {\n    // Either rob current house and add max amount up to i-2,\n    // or skip current house and keep max amount up to i-1\n    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);\n  }\n  \n  return dp[nums.length - 1];\n}"
      },
      {
        id: "dp-3",
        title: "Longest Increasing Subsequence",
        difficulty: "Medium",
        description: "Given an integer array nums, return the length of the longest strictly increasing subsequence. A subsequence is a sequence that can be derived from an array by deleting some or no elements without changing the order of the remaining elements.",
        example: "Input: nums = [10,9,2,5,3,7,101,18]\nOutput: 4\nExplanation: The longest increasing subsequence is [2,3,7,101], therefore the length is 4.",
        solution: "function lengthOfLIS(nums) {\n  if (nums.length === 0) return 0;\n  \n  const n = nums.length;\n  const dp = new Array(n).fill(1); // Each element is at least length 1\n  \n  for (let i = 1; i < n; i++) {\n    for (let j = 0; j < i; j++) {\n      if (nums[i] > nums[j]) {\n        dp[i] = Math.max(dp[i], dp[j] + 1);\n      }\n    }\n  }\n  \n  // Find the maximum value in dp array\n  return Math.max(...dp);\n}"
      }
    ]
  },
  {
    category: "Graphs",
    problems: [
      {
        id: "graph-1",
        title: "Number of Islands",
        difficulty: "Medium",
        description: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.",
        example: "Input: grid = [\n  ['1','1','1','1','0'],\n  ['1','1','0','1','0'],\n  ['1','1','0','0','0'],\n  ['0','0','0','0','0']\n]\nOutput: 1",
        solution: "function numIslands(grid) {\n  if (!grid || grid.length === 0) return 0;\n  \n  const rows = grid.length;\n  const cols = grid[0].length;\n  let count = 0;\n  \n  function dfs(r, c) {\n    // Check if out of bounds or not land\n    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] === '0') {\n      return;\n    }\n    \n    // Mark as visited by changing '1' to '0'\n    grid[r][c] = '0';\n    \n    // Explore in all four directions\n    dfs(r + 1, c);\n    dfs(r - 1, c);\n    dfs(r, c + 1);\n    dfs(r, c - 1);\n  }\n  \n  // Search for islands\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (grid[r][c] === '1') {\n        count++;\n        dfs(r, c); // Mark the entire island as visited\n      }\n    }\n  }\n  \n  return count;\n}"
      },
      {
        id: "graph-2",
        title: "Clone Graph",
        difficulty: "Medium",
        description: "Given a reference of a node in a connected undirected graph. Return a deep copy (clone) of the graph. Each node in the graph contains a value (int) and a list (List[Node]) of its neighbors.",
        example: "Input: adjList = [[2,4],[1,3],[2,4],[1,3]]\nOutput: [[2,4],[1,3],[2,4],[1,3]]",
        solution: "/**\n * Definition for a Node.\n * function Node(val, neighbors) {\n *    this.val = val === undefined ? 0 : val;\n *    this.neighbors = neighbors === undefined ? [] : neighbors;\n * };\n */\nfunction cloneGraph(node) {\n  if (!node) return null;\n  \n  const visited = new Map();\n  \n  function dfs(originalNode) {\n    // If already visited, return the clone\n    if (visited.has(originalNode.val)) {\n      return visited.get(originalNode.val);\n    }\n    \n    // Create a clone node\n    const cloneNode = new Node(originalNode.val);\n    \n    // Add to visited map\n    visited.set(originalNode.val, cloneNode);\n    \n    // Process neighbors\n    for (const neighbor of originalNode.neighbors) {\n      cloneNode.neighbors.push(dfs(neighbor));\n    }\n    \n    return cloneNode;\n  }\n  \n  return dfs(node);\n}"
      },
      {
        id: "graph-3",
        title: "Course Schedule",
        difficulty: "Medium",
        description: "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. For example, the pair [0, 1], indicates that to take course 0 you have to first take course 1. Return true if you can finish all courses. Otherwise, return false.",
        example: "Input: numCourses = 2, prerequisites = [[1,0]]\nOutput: true\nExplanation: There are a total of 2 courses to take. To take course 1 you should have finished course 0. So it is possible.",
        solution: "function canFinish(numCourses, prerequisites) {\n  // Build adjacency list\n  const adjList = new Array(numCourses).fill(0).map(() => []);\n  const visited = new Array(numCourses).fill(0); // 0: not visited, 1: visiting, 2: visited\n  \n  // Fill adjacency list\n  for (const [course, prereq] of prerequisites) {\n    adjList[course].push(prereq);\n  }\n  \n  // DFS to detect cycles\n  function dfs(course) {\n    // If currently visiting - detected cycle\n    if (visited[course] === 1) return false;\n    // If already visited - no cycle\n    if (visited[course] === 2) return true;\n    \n    // Mark as currently visiting\n    visited[course] = 1;\n    \n    // Visit all prerequisites\n    for (const prereq of adjList[course]) {\n      if (!dfs(prereq)) return false;\n    }\n    \n    // Mark as visited\n    visited[course] = 2;\n    return true;\n  }\n  \n  // Check all courses\n  for (let i = 0; i < numCourses; i++) {\n    if (!dfs(i)) return false;\n  }\n  \n  return true;\n}"
      }
    ]
  },
  {
    category: "System Design",
    problems: [
      {
        id: "sd-1",
        title: "Design LRU Cache",
        difficulty: "Medium",
        description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class: LRUCache(int capacity) Initialize the LRU cache with positive size capacity. int get(int key) Return the value of the key if the key exists, otherwise return -1. void put(int key, int value) Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, evict the least recently used key.",
        example: "Input:\n['LRUCache', 'put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get']\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]\nOutput:\n[null, null, null, 1, null, -1, null, -1, 3, 4]",
        solution: "class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n  \n  get(key) {\n    if (!this.cache.has(key)) return -1;\n    \n    // Update recently used by removing and re-adding\n    const value = this.cache.get(key);\n    this.cache.delete(key);\n    this.cache.set(key, value);\n    \n    return value;\n  }\n  \n  put(key, value) {\n    // If key exists, remove it first\n    if (this.cache.has(key)) {\n      this.cache.delete(key);\n    }\n    \n    // If cache is at capacity, remove least recently used item\n    if (this.cache.size >= this.capacity) {\n      // The first item in Map is the least recently used\n      const firstKey = this.cache.keys().next().value;\n      this.cache.delete(firstKey);\n    }\n    \n    // Add new item\n    this.cache.set(key, value);\n  }\n}"
      },
      {
        id: "sd-2",
        title: "Design HashSet",
        difficulty: "Easy",
        description: "Design a HashSet without using any built-in hash table libraries. Implement MyHashSet class: void add(key) Inserts the value key into the HashSet. bool contains(key) Returns whether the value key exists in the HashSet or not. void remove(key) Removes the value key in the HashSet. If key does not exist in the HashSet, do nothing.",
        example: "Input:\n['MyHashSet', 'add', 'add', 'contains', 'contains', 'add', 'contains', 'remove', 'contains']\n[[], [1], [2], [1], [3], [2], [2], [2], [2]]\nOutput:\n[null, null, null, true, false, null, true, null, false]",
        solution: "class MyHashSet {\n  constructor() {\n    this.keyRange = 769; // Prime number for better distribution\n    this.buckets = new Array(this.keyRange).fill().map(() => []);\n  }\n  \n  hash(key) {\n    return key % this.keyRange;\n  }\n  \n  add(key) {\n    const index = this.hash(key);\n    const bucket = this.buckets[index];\n    \n    if (!this.contains(key)) {\n      bucket.push(key);\n    }\n  }\n  \n  remove(key) {\n    const index = this.hash(key);\n    const bucket = this.buckets[index];\n    const keyIndex = bucket.indexOf(key);\n    \n    if (keyIndex !== -1) {\n      bucket.splice(keyIndex, 1);\n    }\n  }\n  \n  contains(key) {\n    const index = this.hash(key);\n    const bucket = this.buckets[index];\n    \n    return bucket.indexOf(key) !== -1;\n  }\n}"
      },
      {
        id: "sd-3",
        title: "Design HashMap",
        difficulty: "Easy",
        description: "Design a HashMap without using any built-in hash table libraries. Implement the MyHashMap class: MyHashMap() initializes the object with an empty map. void put(int key, int value) inserts a (key, value) pair into the HashMap. If the key already exists in the map, update the corresponding value. int get(int key) returns the value to which the specified key is mapped, or -1 if this map contains no mapping for the key. void remove(key) removes the key and its corresponding value if the map contains the mapping for the key.",
        example: "Input:\n['MyHashMap', 'put', 'put', 'get', 'get', 'put', 'get', 'remove', 'get']\n[[], [1, 1], [2, 2], [1], [3], [2, 1], [2], [2], [2]]\nOutput:\n[null, null, null, 1, -1, null, 1, null, -1]",
        solution: "class MyHashMap {\n  constructor() {\n    this.keyRange = 769; // Prime number for better distribution\n    this.buckets = new Array(this.keyRange).fill().map(() => []);\n  }\n  \n  hash(key) {\n    return key % this.keyRange;\n  }\n  \n  put(key, value) {\n    const index = this.hash(key);\n    const bucket = this.buckets[index];\n    \n    // Search for the key\n    for (let i = 0; i < bucket.length; i++) {\n      const [k, v] = bucket[i];\n      if (k === key) {\n        // Update existing key\n        bucket[i][1] = value;\n        return;\n      }\n    }\n    \n    // Key doesn't exist, add new pair\n    bucket.push([key, value]);\n  }\n  \n  get(key) {\n    const index = this.hash(key);\n    const bucket = this.buckets[index];\n    \n    for (const [k, v] of bucket) {\n      if (k === key) {\n        return v;\n      }\n    }\n    \n    return -1; // Key not found\n  }\n  \n  remove(key) {\n    const index = this.hash(key);\n    const bucket = this.buckets[index];\n    \n    for (let i = 0; i < bucket.length; i++) {\n      const [k, v] = bucket[i];\n      if (k === key) {\n        bucket.splice(i, 1);\n        return;\n      }\n    }\n  }\n}"
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
  const [selectedCategory, setSelectedCategory] = useState<string>("Arrays & Hashing");
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
  
  // Reset problem selection when category changes
  useEffect(() => {
    const categoryProblems = CODING_PROBLEMS.find(c => c.category === selectedCategory)?.problems || [];
    if (categoryProblems.length > 0) {
      setSelectedProblem(categoryProblems[0].id);
      setCode("// Write your solution here\n\n");
      setShowSolution(false);
    }
  }, [selectedCategory]);
  
  // Get current problem details
  const getCurrentProblem = () => {
    for (const category of CODING_PROBLEMS) {
      const problem = category.problems.find(p => p.id === selectedProblem);
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
            Practice data structures and algorithms problems with screen and camera recording.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="space-y-4 md:col-span-3">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label htmlFor="category" className="text-sm font-medium block mb-2">Category</label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    disabled={isRecording}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CODING_PROBLEMS.map((category) => (
                        <SelectItem key={category.category} value={category.category}>
                          {category.category}
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
                      {CODING_PROBLEMS.find(c => c.category === selectedCategory)?.problems.map((problem) => (
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
                        ? "Recording in progress" 
                        : "Timer will start when recording begins"}
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
