import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { apiClient } from "../../../services/apiClient";
import { useUser } from "../../../contexts/UserContext";
import { COLORS, SIZES, FONT_SIZES } from "../../../constants";
import { styles } from "./ReceivedRequestsScreen.styles";

interface LessonRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  subject: string;
  requestedTime: string;
  requestedDay: string;
  requestedDate: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

const ReceivedRequestsScreen: React.FC = () => {
  const { user } = useUser();
  const navigation = useNavigation();
  const [requests, setRequests] = useState<LessonRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);

      // Fetch actual requests from the database where current user is the teacher
      const response = await apiClient.get("/requests", {
        params: {
          teacherId: user?.id,
          role: "teacher", // Get requests received as a teacher
        },
      });

      console.log('📥 Received Requests Response:', JSON.stringify(response, null, 2));
      console.log('🔍 Response type:', typeof response);
      console.log('🔍 Response.success:', response?.success);
      console.log('🔍 Response.data:', response?.data ? 'exists' : 'missing');

      if (!response) {
        console.error('❌ No response received');
        setRequests([]);
        return;
      }

      if (response.success === false) {
        console.error('❌ Unsuccessful response:', response.error);
        setRequests([]);
        return;
      }

      // The apiClient returns { success: true, data: { requests: [...], total, page } }
      const requestsData = response.data?.requests || response.data || [];
      
      if (!Array.isArray(requestsData)) {
        console.error('❌ Invalid response format, expected array but got:', typeof requestsData);
        setRequests([]);
        return;
      }

      // Transform database response to match UI interface
      const transformedRequests: LessonRequest[] = requestsData.map(
        (req: any) => {
          const preferredTime = new Date(req.preferredTime);
          const dayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
          const requestedDay = dayNames[preferredTime.getDay()];
          const requestedDate = preferredTime.toISOString().split("T")[0];
          const requestedTime = preferredTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          return {
            id: req.id,
            studentId: req.studentId,
            studentName: req.student?.name || 'Unknown Student',
            studentAvatar: req.student?.avatarUrl || req.student?.avatar_url,
            subject: req.subject || "General Lesson",
            requestedTime: requestedTime,
            requestedDay: requestedDay,
            requestedDate: requestedDate,
            message: req.message || "",
            status: req.status,
            createdAt: req.createdAt,
          };
        }
      );

      setRequests(transformedRequests);
      console.log('✅ Loaded received requests:', transformedRequests.length);
    } catch (error: any) {
      console.error("Failed to load requests:", error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setRequests([]);
      // Don't show alert on first load
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      Alert.alert(
        "Accept Request",
        "Do you want to accept this lesson request?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Accept",
            onPress: async () => {
              try {
                // Call API to update request status
                await apiClient.patch(`/requests/${requestId}`, {
                  status: "accepted",
                });

                // Update local state
                setRequests((prev) =>
                  prev.map((req) =>
                    req.id === requestId ? { ...req, status: "accepted" } : req
                  )
                );

                Alert.alert(
                  "Success",
                  "Lesson request accepted! The student will be notified."
                );
              } catch (error) {
                console.error("Failed to accept request:", error);
                Alert.alert("Error", "Failed to accept request");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Failed to accept request:", error);
      Alert.alert("Error", "Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      Alert.alert(
        "Reject Request",
        "Are you sure you want to reject this request?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Reject",
            style: "destructive",
            onPress: async () => {
              try {
                // Call API to update request status
                await apiClient.patch(`/requests/${requestId}`, {
                  status: "rejected",
                });

                // Update local state
                setRequests((prev) =>
                  prev.map((req) =>
                    req.id === requestId ? { ...req, status: "rejected" } : req
                  )
                );

                Alert.alert("Request Rejected", "The student will be notified.");
              } catch (error) {
                console.error("Failed to reject request:", error);
                Alert.alert("Error", "Failed to reject request");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Failed to reject request:", error);
      Alert.alert("Error", "Failed to reject request");
    }
  };

  const handleMessageStudent = (request: LessonRequest) => {
    // Navigate to messages with the student
    // @ts-ignore
    navigation.navigate("Messages", {
      openConversation: {
        id: request.studentId,
        otherUser: {
          id: request.studentId,
          name: request.studentName,
          avatar: request.studentAvatar,
          role: "student",
        },
      },
    });
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return "Just now";
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else if (diffInHours < 48) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    } catch (error) {
      return "";
    }
  };

  const toggleDayExpansion = (key: string) => {
    const newExpandedDays = new Set(expandedDays);
    if (newExpandedDays.has(key)) {
      newExpandedDays.delete(key);
    } else {
      newExpandedDays.add(key);
    }
    setExpandedDays(newExpandedDays);
  };

  // Group requests by day and time slot
  const groupedRequests = requests.reduce((acc, request) => {
    const key = `${request.requestedDay}-${request.requestedTime}`;
    if (!acc[key]) {
      acc[key] = {
        day: request.requestedDay,
        time: request.requestedTime,
        date: request.requestedDate,
        requests: [],
      };
    }
    acc[key].requests.push(request);
    return acc;
  }, {} as Record<string, { day: string; time: string; date: string; requests: LessonRequest[] }>);

  const renderRequest = ({ item }: { item: LessonRequest }) => (
    <View style={styles.requestCard}>
      {/* Student Info */}
      <View style={styles.studentInfo}>
        {item.studentAvatar ? (
          <Image source={{ uri: item.studentAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.studentName.substring(0, 2).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.studentDetails}>
          <Text style={styles.studentName}>{item.studentName}</Text>
          <Text style={styles.requestTime}>{formatTime(item.createdAt)}</Text>
        </View>
        {item.status !== "pending" && (
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === "accepted" ? "#d4edda" : "#f8d7da",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: item.status === "accepted" ? "#155724" : "#721c24" },
              ]}
            >
              {item.status === "accepted" ? "Accepted" : "Rejected"}
            </Text>
          </View>
        )}
      </View>

      {/* Request Details */}
      <View style={styles.requestDetails}>
        <Text style={styles.subjectLabel}>Subject:</Text>
        <Text style={styles.subjectText}>{item.subject}</Text>

        <Text style={styles.timeLabel}>Requested Time:</Text>
        <Text style={styles.timeText}>
          {item.requestedDay} {item.requestedTime}
        </Text>

        <Text style={styles.messageLabel}>Message:</Text>
        <Text style={styles.messageText} numberOfLines={3}>
          {item.message}
        </Text>
      </View>

      {/* Action Buttons */}
      {item.status === "pending" ? (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleRejectRequest(item.id)}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAcceptRequest(item.id)}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => handleMessageStudent(item)}
        >
          <Text style={styles.messageButtonText}>Send Message</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Received Requests</Text>
        <Text style={styles.subtitle}>
          Manage incoming lesson requests by appointment
        </Text>
      </View>

      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📬</Text>
          <Text style={styles.emptyTitle}>No Requests Yet</Text>
          <Text style={styles.emptyText}>
            When students request lessons, they'll appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={Object.keys(groupedRequests)}
          renderItem={({ item: key }) => {
            const group = groupedRequests[key];
            const isExpanded = expandedDays.has(key);
            const pendingCount = group.requests.filter(
              (r) => r.status === "pending"
            ).length;

            return (
              <View style={styles.appointmentGroup}>
                {/* Appointment Header */}
                <TouchableOpacity
                  style={styles.appointmentHeader}
                  onPress={() => toggleDayExpansion(key)}
                >
                  <View style={styles.appointmentHeaderContent}>
                    <Text style={styles.appointmentDay}>{group.day}</Text>
                    <Text style={styles.appointmentTime}>{group.time}</Text>
                    <Text style={styles.appointmentSubtitle}>
                      {group.requests.length} request
                      {group.requests.length !== 1 ? "s" : ""}
                      {pendingCount > 0 && ` • ${pendingCount} pending`}
                    </Text>
                  </View>
                  <View style={styles.expandIconContainer}>
                    {pendingCount > 0 && (
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingBadgeText}>
                          {pendingCount}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.expandIcon}>
                      {isExpanded ? "▼" : "▶"}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Requests List */}
                {isExpanded && (
                  <View style={styles.requestsContainer}>
                    {group.requests.map((request) => (
                      <View key={request.id} style={styles.requestCard}>
                        {/* Student Info */}
                        <View style={styles.requestHeader}>
                          <View style={styles.studentInfo}>
                            <View style={styles.avatar}>
                              <Text style={styles.avatarText}>
                                {request.studentAvatar ||
                                  request.studentName
                                    .substring(0, 2)
                                    .toUpperCase()}
                              </Text>
                            </View>
                            <View style={styles.studentDetails}>
                              <Text style={styles.studentName}>
                                {request.studentName}
                              </Text>
                              <Text style={styles.requestTime}>
                                {new Date(
                                  request.createdAt
                                ).toLocaleDateString()}
                              </Text>
                            </View>
                          </View>
                          {request.status !== "pending" && (
                            <View
                              style={[
                                styles.statusBadge,
                                {
                                  backgroundColor:
                                    request.status === "accepted"
                                      ? "#d4edda"
                                      : "#f8d7da",
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusText,
                                  {
                                    color:
                                      request.status === "accepted"
                                        ? "#155724"
                                        : "#721c24",
                                  },
                                ]}
                              >
                                {request.status === "accepted"
                                  ? "Accepted"
                                  : "Rejected"}
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Request Details */}
                        <View style={styles.requestDetails}>
                          <Text style={styles.subjectLabel}>Subject:</Text>
                          <Text style={styles.subjectText}>
                            {request.subject}
                          </Text>

                          {request.message && (
                            <>
                              <Text style={styles.messageLabel}>Message:</Text>
                              <Text
                                style={styles.messageText}
                                numberOfLines={3}
                              >
                                {request.message}
                              </Text>
                            </>
                          )}
                        </View>

                        {/* Action Buttons */}
                        {request.status === "pending" ? (
                          <View style={styles.actionButtons}>
                            <TouchableOpacity
                              style={styles.rejectButton}
                              onPress={() => handleRejectRequest(request.id)}
                            >
                              <Text style={styles.rejectButtonText}>
                                Reject
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.acceptButton}
                              onPress={() => handleAcceptRequest(request.id)}
                            >
                              <Text style={styles.acceptButtonText}>
                                Accept
                              </Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.messageButton}
                            onPress={() => handleMessageStudent(request)}
                          >
                            <Text style={styles.messageButtonText}>
                              Send Message
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          }}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadRequests();
              }}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ReceivedRequestsScreen;
