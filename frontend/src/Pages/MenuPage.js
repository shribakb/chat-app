import React from "react";
import { useHistory } from "react-router-dom";
import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Box, Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import {
  BellIcon,
  ChevronDownIcon,
  DeleteIcon,
  EditIcon,
  AddIcon,
  PlusSquareIcon,
} from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "../components/ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "../components/miscellaneous/ProfileModal";
// import NotificationBadge from "react-notification-badge";
// import { Effect } from "react-notification-badge";
import { getSender } from "../Config/ChatLogics";
import UserListItem from "../components/UserAvatar/UserListItem";
import { ChatState } from "../Context/chatProvider";
import Badge from "../components/Bage";

import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Image,
  Circle,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
} from "@chakra-ui/react";
import io from "socket.io-client";

const MenuPage = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [group, setGroup] = useState();
  const [gender, setGender] = useState();
  const [dateOfBirth, setBirthday] = useState();
  const [confirmpassword, setConfirmPassword] = useState();
  const [pic, setPic] = useState();
  const socket = io("http://localhost:5000");
  const { setSelectedChat, notification, setNotification, chats, setChats } =
    ChatState();
  const user = JSON.parse(localStorage.getItem("userInfo"));
  const initialRef = React.useRef(null);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory();
  // const OnlineUsers = JSON.parse(localStorage.getItem("onlineUsers"));
  const logoutHandler = async () => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "/api/user/status",
        {
          userId: user._id,
          status: false,
        },
        config
      );
    } catch (error) {
      console.log(error);
    }
    socket.emit("userLoggedOut", { userId: user.email });

    localStorage.removeItem("userInfo");
    history.push("/");
  };
  const handleMenu = () => {
    history.push("/menu");
  };
  const handleButtonClick = () => {
    history.push("/chats");
  };
  const [isSuccess, setIsSuccess] = useState(false);
  const [online, setOnline] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [data, setData] = useState([]);
  const [isOpenModal2, setIsOpenModal2] = useState(false);
  const onCloseModal2 = () => setIsOpenModal2(false);

  const [isOpenModal3, setIsOpenModal3] = useState(false);
  const onCloseModal3 = () => setIsOpenModal3(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsOpenModal2(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setIsOpenModal3(true);
  };

  const postDetails = (pics) => {
    setLoading(true);
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    console.log(pics);
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "iveryloveiot");
      data.append("cloud_name", "loveiot");
      fetch("https://api.cloudinary.com/v1_1/loveiot/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          console.log(data.url.toString());
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
  };

  const handleEdit = async (user_) => {
    setLoading(true);
    if (!name || !email || !group || !gender || !dateOfBirth) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "/api/user/edit",
        {
          userId: user_._id,
          name: name,
          email: email,
          gender: gender,
          group: group,
          dateOfBirth: dateOfBirth,
        },
        config
      );
      console.log(data);
      toast({
        title: "Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setIsOpenModal2(false);
      setLoading(false);
      history.push("/menu");
      window.location.reload();
      // history.push("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  const handleDelete = async (user_) => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "/api/user/delete",
        {
          userId: user_._id,
        },
        config
      );
      console.log(data);
      toast({
        title: "Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setIsOpenModal2(false);
      setLoading(false);
      history.push("/menu");
      window.location.reload();
      // history.push("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  const submitHandler = async () => {
    setLoading(true);
    if (
      !name ||
      !email ||
      !password ||
      !confirmpassword ||
      !group ||
      !gender ||
      !dateOfBirth
    ) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
    if (password !== confirmpassword) {
      toast({
        title: "Passwords Do Not Match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/api/user",
        {
          name: name,
          email: email,
          password: password,
          pic: pic,
          group: group,
          gender: gender,
          dateOfBirth: dateOfBirth,
        },
        config
      );
      console.log(data);
      toast({
        title: "Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setIsSuccess(true);
      onClose();
      setLoading(false);
      history.push("/menu");
      // history.push("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get("/api/data")
      .then((response) => {
        // Дані успішно отримані
        console.log(response.data);
      })
      .catch((error) => {
        // Виникла помилка при отриманні даних
        console.error("Помилка отримання даних:", error);
      });

    const fetchData = async () => {
      try {
        setLoading(true);

        const config = {
          headers: {
            "Content-type": "application/json",
          },
        };

        const { data } = await axios.get(`/api/user?search=${search}`, config);

        setLoading(false);
        setSearchResult(data);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to Load the Search Results",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
      }
    };

    fetchData();
    // return () => {
    //   socket.off("onlineUsers");
    // };
  }, []);
  useEffect(() => {
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
      localStorage.removeItem("onlineUsers");
      localStorage.setItem("onlineUsers", JSON.stringify(users));
    });
    console.log(onlineUsers);
    return () => {
      socket.disconnect();
    };
  });

  return (
    <>
      <Box display="inline-block" width="100%" s>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bg="white"
          width="100%"
          height="10%"
          padding="5px 10px 5px 10px"
          borderWidth="5px"
        >
          <Button onClick={handleButtonClick}>
            <Text fontSize="2xl" fontFamily="Work sans">
              CMS
            </Text>
          </Button>
          <div>
            <Menu>
              <MenuButton p={1} position="relative">
                <BellIcon fontSize="2xl" margin={1} />
                <Box position="absolute" top="0" right="0">
                  <Badge count={notification.length} />
                </Box>
              </MenuButton>
              <MenuList paddingLeft={2}>
                {!notification.length && "No New Messages"}
                {notification.map((notif) => (
                  <MenuItem
                    key={notif._id}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n !== notif));
                    }}
                  >
                    {notif.chat.isGroupChat
                      ? `New Message in ${notif.chat.chatName}`
                      : `New Message from ${getSender(user, notif.chat.users)}`}
                  </MenuItem>
                ))}
                <MenuItem onClick={handleButtonClick}>Chats</MenuItem>
              </MenuList>
            </Menu>
            <Menu>
              <MenuButton
                as={Button}
                bg="white"
                rightIcon={<ChevronDownIcon />}
              >
                <Avatar
                  size="sm"
                  cursor="pointer"
                  name={user.name}
                  src={user.pic}
                />
              </MenuButton>
              <MenuList>
                <ProfileModal user={user}>
                  <MenuItem>My Profile</MenuItem>{" "}
                </ProfileModal>
                <MenuDivider />
                <MenuItem onClick={logoutHandler}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </div>
        </Box>
        <Box width="75%" margin="auto" marginTop="100px">
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton
              size="sm"
              marginRight={20}
              marginBottom={5}
              icon={<PlusSquareIcon />}
              onClick={onOpen}
            />
          </div>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th textAlign="center">
                    <input type="checkbox" />
                  </Th>
                  <Th textAlign="center">Group</Th>
                  <Th textAlign="center">Name</Th>
                  <Th textAlign="center">Gender</Th>
                  <Th textAlign="center">Birthday</Th>
                  <Th textAlign="center">Status</Th>
                  <Th textAlign="center">Options</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <ChatLoading />
                ) : (
                  searchResult?.map((user, index) => (
                    <Tr key={index}>
                      <Td textAlign="center">
                        <input type="checkbox" />
                      </Td>
                      <Td textAlign="center">{user.group}</Td>
                      <Td textAlign="center">{user.name}</Td>
                      <Td textAlign="center">{user.gender}</Td>
                      <Td textAlign="center">{user.dateOfBirth}</Td>
                      <Td>
                        <Circle
                          marginLeft={10}
                          size="20px"
                          bg={
                            onlineUsers.includes(user.email)
                              ? "green"
                              : user.status
                              ? "green"
                              : "gray"
                          } // Перевірка, чи користувач в онлайні
                          color={
                            onlineUsers.includes(user.email)
                              ? "green"
                              : user.status
                              ? "green"
                              : "gray"
                          }
                        />
                      </Td>
                      <Td textAlign="center">
                        <IconButton
                          size="sm"
                          icon={<EditIcon />}
                          marginRight="10px"
                          onClick={() => openEditModal(user)}
                        />
                        <IconButton
                          size="sm"
                          icon={<DeleteIcon />}
                          marginRight="10px"
                          onClick={() => openDeleteModal(user)}
                        />
                      </Td>
                    </Tr>
                  ))
                )}
                {loadingChat && <Spinner marginLeft="auto" display="flex" />}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
        {/* <Text>{`Online Users: ${onlineUsers}`}</Text> */}
      </Box>
      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add student</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl id="fisrt-name" isRequired mt={3}>
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="Enter your name"
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
            <FormControl id="email" isRequired mt={3}>
              <FormLabel>Email</FormLabel>
              <Input
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            <FormControl id="password" isRequired mt={3}>
              <FormLabel>Pasword</FormLabel>
              <InputGroup>
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleClick}>
                    {show ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <FormControl id="password" isRequired mt={3}>
              <FormLabel>Confirm password</FormLabel>
              <InputGroup>
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Confirm your password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleClick}>
                    {show ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <FormControl id="group" isRequired mt={3}>
              <FormLabel>Group</FormLabel>
              <Input
                placeholder="Enter your group"
                onChange={(e) => setGroup(e.target.value)}
              />
            </FormControl>
            <FormControl id="gender" isRequired mt={3}>
              <FormLabel>Gender</FormLabel>
              <Input
                placeholder="Enter your gender"
                onChange={(e) => setGender(e.target.value)}
              />
            </FormControl>
            <FormControl id="birthday" isRequired mt={3}>
              <FormLabel>Birthday</FormLabel>
              <Input
                placeholder="Enter your birthday"
                onChange={(e) => setBirthday(e.target.value)}
              />
            </FormControl>
            <FormControl id="pic" isRequired mt={3}>
              <FormLabel>Upload your Picture</FormLabel>
              <Input
                type="file"
                p={1.5}
                accept="image/*"
                onChange={(e) => postDetails(e.target.files[0])}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={submitHandler}
              isLoading={loading}
              width="100%"
            >
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenModal2} onClose={onCloseModal2} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete student</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p>
              Are you sure you want to delete student{" "}
              {selectedUser && selectedUser.name}?
            </p>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => handleDelete(selectedUser)}
              isLoading={loading}
            >
              Delete
            </Button>
            <Button variant="ghost" onClick={onCloseModal2}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        initialFocusRef={initialRef}
        isOpen={isOpenModal3}
        onClose={onCloseModal3}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit student</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired mt={3}>
              <FormLabel>Name</FormLabel>
              <Input
                // placeholder="Enter your name"
                placeholder={selectedUser && selectedUser.name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired mt={3}>
              <FormLabel>Email</FormLabel>
              <Input
                // placeholder="Enter your email"
                placeholder={selectedUser && selectedUser.email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            {/* <FormControl isRequired mt={3}>
              <FormLabel>Pasword</FormLabel>
              <InputGroup>
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Enter your password"
                  value={selectedUser.password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleClick}>
                    {show ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl> */}
            <FormControl isRequired mt={3}>
              <FormLabel>Group</FormLabel>
              <Input
                // placeholder="Enter your group"
                placeholder={selectedUser && selectedUser.group}
                onChange={(e) => setGroup(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired mt={3}>
              <FormLabel>Gender</FormLabel>
              <Input
                // placeholder="Enter your gender"
                placeholder={selectedUser && selectedUser.gender}
                onChange={(e) => setGender(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired mt={3}>
              <FormLabel>Birthday</FormLabel>
              <Input
                // placeholder="Enter your birthday"
                placeholder={selectedUser && selectedUser.dateOfBirth}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={() => handleEdit(selectedUser)}
              isLoading={loading}
              width="100%"
            >
              Edit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MenuPage;
