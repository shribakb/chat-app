import { Avatar, AvatarBadge } from "@chakra-ui/avatar";
import { Box, Text } from "@chakra-ui/layout";
import { ChatState } from "../../Context/chatProvider";
import { Stack } from "@chakra-ui/react";
const UserListItem = ({ user, handleFunction }) => {
  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="#E8E8E8"
      _hover={{
        background: "#38B2AC",
        color: "white",
      }}
      width="100%"
      display="flex"
      alignItems="center"
      color="black"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
    >
      <Stack direction="row" spacing={4} paddingRight={2}>
        <Avatar width={10} height={10}>
          <AvatarBadge
            boxSize="1em"
            bg={user.status ? "green.500" : "gray.500"}
          />
        </Avatar>
      </Stack>

      <Box>
        <Text>{user.name}</Text>
        <Text fontSize="xs">
          <b>Email : </b>
          {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;
